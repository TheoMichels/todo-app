import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

function createTsLoader(mocks = {}) {
  const cache = new Map();
  function load(filePath) {
    const resolved = path.resolve(filePath);
    if (cache.has(resolved)) return cache.get(resolved).exports;
    const module = { exports: {} };
    cache.set(resolved, module);

    const source = fs.readFileSync(resolved, 'utf8');
    const code = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;

    const requireFunc = (id) => {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (id.startsWith('.')) {
        const target = path.resolve(path.dirname(resolved), id);
        for (const [mockId, mock] of Object.entries(mocks)) {
          if (mockId.startsWith('.') && path.resolve(path.dirname(resolved), mockId) === target) {
            return mock;
          }
        }
        for (const suffix of ['', '.ts', '.tsx']) {
          const candidate = target + suffix;
          if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            return load(candidate);
          }
        }
      }
      return createRequire(resolved)(id);
    };

    const wrapper = vm.runInThisContext(
      `(function(require, module, exports) { ${code}\n })`,
      { filename: resolved }
    );
    wrapper(requireFunc, module, module.exports);
    return module.exports;
  }
  return load;
}

function getSchemas() {
  const loader = createTsLoader();
  return loader('src/types/schemas.ts');
}

function getRepositories(seed = new Map()) {
  const mocks = {
    '@react-native-async-storage/async-storage': {
      default: {
        getItem: async (k) => seed.get(k) ?? null,
        setItem: async (k, v) => seed.set(k, v),
        removeItem: async (k) => seed.delete(k),
      },
      getItem: async (k) => seed.get(k) ?? null,
      setItem: async (k, v) => seed.set(k, v),
      removeItem: async (k) => seed.delete(k),
    },
    'expo-constants': {
      default: { expoConfig: { extra: { storageMode: 'local' } } },
    },
  };
  const loader = createTsLoader(mocks);
  return {
    sectionRepo: loader('src/storage/sectionRepository.ts').sectionRepository,
    todoRepo: loader('src/storage/todoRepository.ts').todoRepository,
    noteRepo: loader('src/storage/noteRepository.ts').noteRepository,
    trackingRepo: loader('src/storage/trackingRepository.ts').trackingRepository,
  };
}

// -------------------------------------------------------------
// AC-02: Zod Schemas Unit Tests (Valides, Partiels, Corrompus)
// -------------------------------------------------------------

test('AC-02 SectionSchema accepts valid sections', () => {
  const { SectionSchema } = getSchemas();
  const valid = { id: 'sec-1', name: 'Travail', createdAt: 1700000000000 };
  const parsed = SectionSchema.parse(valid);
  assert.deepEqual(parsed, valid);
});

test('AC-02 SectionSchema rejects corrupted or empty fields with explicit French messages', () => {
  const { SectionSchema } = getSchemas();
  assert.throws(() => SectionSchema.parse({ id: '', name: 'Travail', createdAt: 100 }), /identifiant/);
  assert.throws(() => SectionSchema.parse({ id: '1', name: '   ', createdAt: 100 }), /nom/);
  assert.throws(() => SectionSchema.parse({ id: '1', name: 'Travail', createdAt: -1 }), /positive/);
  assert.throws(() => SectionSchema.parse({ id: '1', name: 'Travail', createdAt: 12.34 }), /entier/);
});

test('AC-02 TodoSchema handles valid, partial (default priority), and corrupted todos', () => {
  const { TodoSchema } = getSchemas();

  // Valide complet
  const validUrgent = {
    id: 't-1',
    sectionId: 'sec-1',
    title: 'Finir Lot 3',
    done: false,
    priority: 'urgent',
    order: 1,
    createdAt: 1700000000000,
  };
  assert.deepEqual(TodoSchema.parse(validUrgent), validUrgent);

  // Partiel : priorité omise -> par défaut "standard"
  const partial = {
    id: 't-2',
    sectionId: 'sec-1',
    title: 'Tâche ordinaire',
    done: true,
    order: 2,
    createdAt: 1700000000000,
  };
  const parsedPartial = TodoSchema.parse(partial);
  assert.equal(parsedPartial.priority, 'standard');

  // Corrompus
  assert.throws(() => TodoSchema.parse({ ...validUrgent, title: '  ' }), /titre/);
  assert.throws(() => TodoSchema.parse({ ...validUrgent, priority: 'inconnue' }), /priorité/);
  assert.throws(() => TodoSchema.parse({ ...validUrgent, done: 'non' }), /booléen/);
  assert.throws(() => TodoSchema.parse({ ...validUrgent, sectionId: '' }), /section/);
});

test('AC-02 NoteSchema handles valid, partial (default description), and corrupted notes', () => {
  const { NoteSchema } = getSchemas();

  // Valide complet
  const valid = { id: 'n-1', title: 'Idée', description: 'Une super idée', createdAt: 1000 };
  assert.deepEqual(NoteSchema.parse(valid), valid);

  // Partiel : description omise -> par défaut ""
  const partial = { id: 'n-2', title: 'Titre seul', createdAt: 2000 };
  const parsedPartial = NoteSchema.parse(partial);
  assert.equal(parsedPartial.description, '');

  // Corrompus
  assert.throws(() => NoteSchema.parse({ id: '', title: 'Note', createdAt: 1000 }), /identifiant/);
  assert.throws(() => NoteSchema.parse({ id: 'n-1', title: '', createdAt: 1000 }), /titre/);
  assert.throws(() => NoteSchema.parse({ id: 'n-1', title: 'Note', createdAt: 12.34 }), /entier/);
  assert.throws(() => NoteSchema.parse({ id: 'n-1', title: 'Note', createdAt: 'hier' }), /number|nombre/);
});

test('AC-02 TrackingPointSchema handles valid, partial (optional dueDate, defaults), and corrupted tracking points', () => {
  const { TrackingPointSchema } = getSchemas();

  // Valide complet
  const valid = {
    id: 'tp-1',
    sectionId: 'sec-1',
    title: 'Livraison v1',
    status: 'En cours',
    nextStep: 'Valider QA',
    dueDate: '2026-10-31',
    order: 1,
    createdAt: 1000,
  };
  assert.deepEqual(TrackingPointSchema.parse(valid), valid);

  // Partiel : sans dueDate, status et nextStep omis
  const partial = {
    id: 'tp-2',
    sectionId: 'sec-1',
    title: 'Point d’étape',
    order: 2,
    createdAt: 2000,
  };
  const parsedPartial = TrackingPointSchema.parse(partial);
  assert.equal(parsedPartial.dueDate, undefined);
  assert.equal(parsedPartial.status, '');
  assert.equal(parsedPartial.nextStep, '');

  // Corrompus
  assert.throws(() => TrackingPointSchema.parse({ ...valid, title: '' }), /titre/);
  assert.throws(() => TrackingPointSchema.parse({ ...valid, dueDate: '31/10/2026' }), /AAAA-MM-JJ/);
  assert.throws(() => TrackingPointSchema.parse({ ...valid, order: NaN }), /number|nombre|fini/);
  assert.throws(() => TrackingPointSchema.parse({ ...valid, order: Infinity }), /number|nombre|fini/);
});

// -------------------------------------------------------------
// AC-04: Storage & Repositories (Corruption, Migration, CRUD)
// -------------------------------------------------------------

test('AC-04 corrupted storage rejects reads and writes without altering existing bytes', async () => {
  const corruptedValues = ['{', '{}', '[{"id": 123}]', 'null'];

  for (const badValue of corruptedValues) {
    // Test sectionRepository
    const secSeed = new Map([['@todo_sections_v1', badValue]]);
    const { sectionRepo } = getRepositories(secSeed);
    await assert.rejects(sectionRepo.list(), /Données locales/);
    await assert.rejects(sectionRepo.create('Test'), /Données locales/);
    assert.equal(secSeed.get('@todo_sections_v1'), badValue);

    // Test todoRepository
    const todoSeed = new Map([['@todo_todos_v1', badValue]]);
    const { todoRepo } = getRepositories(todoSeed);
    await assert.rejects(todoRepo.list(), /Données locales/);
    await assert.rejects(todoRepo.create({ sectionId: 's1', title: 'Tâche' }), /Données locales/);
    assert.equal(todoSeed.get('@todo_todos_v1'), badValue);

    // Test noteRepository
    const noteSeed = new Map([['@todo_notes_v1', badValue]]);
    const { noteRepo } = getRepositories(noteSeed);
    await assert.rejects(noteRepo.list(), /Données locales/);
    await assert.rejects(noteRepo.create({ title: 'Note' }), /Données locales/);
    assert.equal(noteSeed.get('@todo_notes_v1'), badValue);

    // Test trackingRepository
    const trackSeed = new Map([['@todo_trackings_v1', badValue]]);
    const { trackingRepo } = getRepositories(trackSeed);
    await assert.rejects(trackingRepo.list(), /Données locales/);
    await assert.rejects(
      trackingRepo.create({ sectionId: 's1', title: 'Point' }),
      /Données locales/
    );
    assert.equal(trackSeed.get('@todo_trackings_v1'), badValue);
  }
});

test('AC-04 legacy keys todo-app:* are read transparently and smoothly migrated to @todo_*_v1', async () => {
  const legacySections = [{ id: 'sec-old', name: 'Historique', createdAt: 123456 }];
  const legacyTodos = [
    { id: 'todo-old', sectionId: 'sec-old', title: 'Tâche ancienne', done: false, priority: 'standard', order: 1, createdAt: 123456 },
  ];
  const legacyNotes = [{ id: 'note-old', title: 'Note ancienne', description: 'Contenu', createdAt: 123456 }];
  const legacyTrackings = [
    { id: 'track-old', sectionId: 'sec-old', title: 'Point ancien', status: 'OK', nextStep: 'Rien', order: 1, createdAt: 123456 },
  ];

  const seed = new Map([
    ['todo-app:sections', JSON.stringify(legacySections)],
    ['todo-app:todos', JSON.stringify(legacyTodos)],
    ['todo-app:notes', JSON.stringify(legacyNotes)],
    ['todo-app:trackings', JSON.stringify(legacyTrackings)],
  ]);

  const { sectionRepo, todoRepo, noteRepo, trackingRepo } = getRepositories(seed);

  // Lecture des sections et vérification de la migration
  const sections = await sectionRepo.list();
  assert.equal(sections.length, 1);
  assert.equal(sections[0].name, 'Historique');
  assert.ok(seed.has('@todo_sections_v1'), 'La clé cible @todo_sections_v1 doit être créée');
  assert.deepEqual(JSON.parse(seed.get('@todo_sections_v1')), legacySections);

  // Lecture des todos et vérification de la migration
  const todos = await todoRepo.list();
  assert.equal(todos.length, 1);
  assert.equal(todos[0].title, 'Tâche ancienne');
  assert.ok(seed.has('@todo_todos_v1'), 'La clé cible @todo_todos_v1 doit être créée');
  assert.deepEqual(JSON.parse(seed.get('@todo_todos_v1')), legacyTodos);

  // Lecture des notes et vérification de la migration
  const notes = await noteRepo.list();
  assert.equal(notes.length, 1);
  assert.equal(notes[0].title, 'Note ancienne');
  assert.ok(seed.has('@todo_notes_v1'), 'La clé cible @todo_notes_v1 doit être créée');
  assert.deepEqual(JSON.parse(seed.get('@todo_notes_v1')), legacyNotes);

  // Lecture des trackings et vérification de la migration
  const trackings = await trackingRepo.list();
  assert.equal(trackings.length, 1);
  assert.equal(trackings[0].title, 'Point ancien');
  assert.ok(seed.has('@todo_trackings_v1'), 'La clé cible @todo_trackings_v1 doit être créée');
  assert.deepEqual(JSON.parse(seed.get('@todo_trackings_v1')), legacyTrackings);
});

test('AC-04 repositories fulfill strict contract (list, get, create, update, remove)', async () => {
  const seed = new Map();
  const { sectionRepo, todoRepo, noteRepo, trackingRepo } = getRepositories(seed);

  // --- SectionRepository CRUD ---
  assert.deepEqual(await sectionRepo.list(), []);
  const createdSec = await sectionRepo.create('Section Test');
  assert.equal(createdSec.name, 'Section Test');
  assert.equal(await sectionRepo.get('inexistant'), null);
  assert.deepEqual(await sectionRepo.get(createdSec.id), createdSec);

  const updatedSec = await sectionRepo.update(createdSec.id, 'Section Renommée');
  assert.equal(updatedSec.name, 'Section Renommée');
  assert.equal((await sectionRepo.get(createdSec.id))?.name, 'Section Renommée');

  await sectionRepo.remove(createdSec.id);
  assert.deepEqual(await sectionRepo.list(), []);
  assert.equal(await sectionRepo.get(createdSec.id), null);

  // --- TodoRepository CRUD ---
  const createdTodo = await todoRepo.create({
    sectionId: 'sec-1',
    title: 'Acheter du pain',
    priority: 'urgent',
  });
  assert.equal(createdTodo.title, 'Acheter du pain');
  assert.equal(createdTodo.priority, 'urgent');
  assert.deepEqual(await todoRepo.get(createdTodo.id), createdTodo);

  const updatedTodo = await todoRepo.update(createdTodo.id, { done: true });
  assert.equal(updatedTodo.done, true);

  // list avec filtres
  const pendingTodos = await todoRepo.list({ done: false });
  assert.equal(pendingTodos.length, 0);
  const doneTodos = await todoRepo.list({ done: true });
  assert.equal(doneTodos.length, 1);

  await todoRepo.remove(createdTodo.id);
  assert.deepEqual(await todoRepo.list(), []);

  // --- NoteRepository CRUD ---
  const createdNote = await noteRepo.create({ title: 'Idée startup', description: 'Une idée' });
  assert.equal(createdNote.title, 'Idée startup');
  assert.deepEqual(await noteRepo.get(createdNote.id), createdNote);

  const updatedNote = await noteRepo.update(createdNote.id, { description: 'Description mise à jour' });
  assert.equal(updatedNote.description, 'Description mise à jour');

  await noteRepo.remove(createdNote.id);
  assert.deepEqual(await noteRepo.list(), []);

  // --- TrackingRepository CRUD ---
  const createdTrack = await trackingRepo.create({
    sectionId: 'sec-1',
    title: 'Audit sécurité',
    status: 'Planifié',
    nextStep: 'Lancer pentest',
    dueDate: '2026-11-15',
  });
  assert.equal(createdTrack.title, 'Audit sécurité');
  assert.equal(createdTrack.dueDate, '2026-11-15');
  assert.deepEqual(await trackingRepo.get(createdTrack.id), createdTrack);

  const updatedTrack = await trackingRepo.update(createdTrack.id, { status: 'Terminé' });
  assert.equal(updatedTrack.status, 'Terminé');

  await trackingRepo.remove(createdTrack.id);
  assert.deepEqual(await trackingRepo.list(), []);
});

test('AC-04 invalid form inputs are rejected before persistence with French error messages', async () => {
  const seed = new Map();
  const { sectionRepo, todoRepo, noteRepo, trackingRepo } = getRepositories(seed);

  // Section avec nom vide
  await assert.rejects(sectionRepo.create('   '), /Valeurs invalides/);
  // Todo avec titre vide ou priorité invalide
  await assert.rejects(
    todoRepo.create({ sectionId: 's1', title: '' }),
    /Valeurs invalides/
  );
  await assert.rejects(
    todoRepo.create({ sectionId: 's1', title: 'OK', priority: 'invalid-priority' }),
    /Valeurs invalides/
  );
  // Note avec titre vide
  await assert.rejects(noteRepo.create({ title: '   ' }), /Valeurs invalides/);
  // Tracking avec échéance non conforme AAAA-MM-JJ
  await assert.rejects(
    trackingRepo.create({ sectionId: 's1', title: 'Point', dueDate: 'demain' }),
    /Valeurs invalides/
  );

  // Rien n'a été persisté
  assert.equal(seed.size, 0);
});

test('AC-01 legacy keys with heterogeneous legacy formats (dates ISO, nextDueDate, missing order/sectionId) are normalized and migrated to @todo_*_v1', async () => {
  const heterogeneousSections = [
    { id: 'sec-old', name: 'Historique ISO', createdAt: '2023-05-10T14:30:00.000Z' },
  ];
  const heterogeneousTodos = [
    {
      id: 'todo-old-1',
      title: 'Tâche sans ordre ni date ms',
      done: false,
      createdAt: '2023-05-10T14:35:00.000Z',
    },
  ];
  const heterogeneousNotes = [
    {
      id: 'note-old-1',
      title: 'Note sans description',
      createdAt: '2023-05-10T14:40:00.000Z',
    },
  ];
  const heterogeneousTrackings = [
    {
      id: 'track-old-1',
      title: 'Point de suivi ancien',
      status: 'en_attente',
      nextStep: 'Relancer',
      nextDueDate: '2026-11-20T00:00:00.000Z',
      createdAt: '2023-05-10T14:45:00.000Z',
    },
  ];

  const seed = new Map([
    ['todo-app:sections', JSON.stringify(heterogeneousSections)],
    ['todo-app:todos', JSON.stringify(heterogeneousTodos)],
    ['todo-app:notes', JSON.stringify(heterogeneousNotes)],
    ['todo-app:trackings', JSON.stringify(heterogeneousTrackings)],
  ]);

  const { sectionRepo, todoRepo, noteRepo, trackingRepo } = getRepositories(seed);

  const sections = await sectionRepo.list();
  assert.equal(sections.length, 1);
  assert.equal(sections[0].id, 'sec-old');
  assert.equal(typeof sections[0].createdAt, 'number');
  assert.ok(sections[0].createdAt > 0);
  assert.ok(seed.has('@todo_sections_v1'));

  const todos = await todoRepo.list();
  assert.equal(todos.length, 1);
  assert.equal(todos[0].title, 'Tâche sans ordre ni date ms');
  assert.equal(todos[0].priority, 'standard');
  assert.equal(typeof todos[0].order, 'number');
  assert.ok(Number.isFinite(todos[0].order));
  assert.equal(typeof todos[0].createdAt, 'number');
  assert.ok(todos[0].sectionId.length > 0);
  assert.ok(seed.has('@todo_todos_v1'));

  const notes = await noteRepo.list();
  assert.equal(notes.length, 1);
  assert.equal(notes[0].title, 'Note sans description');
  assert.equal(notes[0].description, '');
  assert.equal(typeof notes[0].createdAt, 'number');
  assert.ok(seed.has('@todo_notes_v1'));

  const trackings = await trackingRepo.list();
  assert.equal(trackings.length, 1);
  assert.equal(trackings[0].title, 'Point de suivi ancien');
  assert.equal(trackings[0].dueDate, '2026-11-20');
  assert.equal(typeof trackings[0].order, 'number');
  assert.ok(trackings[0].sectionId.length > 0);
  assert.equal(typeof trackings[0].createdAt, 'number');
  assert.ok(seed.has('@todo_trackings_v1'));
});

test('AC-01 & AC-02 repository.remove invokes deleteItemFromCloud and cleans local store', async () => {
  const deletedCloudCalls = [];
  const seed = new Map();

  const syncServicePath = path.resolve('src/services/syncService.ts');
  const storageModePath = path.resolve('src/config/storageMode.ts');

  const mocks = {
    '@react-native-async-storage/async-storage': {
      default: {
        getItem: async (k) => seed.get(k) ?? null,
        setItem: async (k, v) => seed.set(k, v),
        removeItem: async (k) => seed.delete(k),
      },
      getItem: async (k) => seed.get(k) ?? null,
      setItem: async (k, v) => seed.set(k, v),
      removeItem: async (k) => seed.delete(k),
    },
    'expo-constants': {
      default: { expoConfig: { extra: { storageMode: 'supabase' } } },
    },
    '../config/storageMode': {
      isLocalMode: false,
      storageMode: 'supabase',
    },
    '../services/syncService': {
      deleteItemFromCloud: async (collection, id) => {
        deletedCloudCalls.push({ collection, id });
      },
      syncCollectionToCloud: async () => {},
      clearLocalCache: async () => {},
    },
  };

  const loader = createTsLoader(mocks);
  const sectionRepo = loader('src/storage/sectionRepository.ts').sectionRepository;
  const todoRepo = loader('src/storage/todoRepository.ts').todoRepository;
  const noteRepo = loader('src/storage/noteRepository.ts').noteRepository;
  const trackingRepo = loader('src/storage/trackingRepository.ts').trackingRepository;

  // 1. Sections
  const sec = await sectionRepo.create('Section à supprimer');
  assert.equal((await sectionRepo.list()).length, 1);
  await sectionRepo.remove(sec.id);
  assert.equal((await sectionRepo.list()).length, 0);
  assert.ok(deletedCloudCalls.some((c) => c.collection === 'sections' && c.id === sec.id));

  // 2. Todos
  const todo = await todoRepo.create({ sectionId: 'sec-1', title: 'Todo à supprimer' });
  assert.equal((await todoRepo.list()).length, 1);
  await todoRepo.remove(todo.id);
  assert.equal((await todoRepo.list()).length, 0);
  assert.ok(deletedCloudCalls.some((c) => c.collection === 'todos' && c.id === todo.id));

  // 3. Notes
  const note = await noteRepo.create({ title: 'Note à supprimer' });
  assert.equal((await noteRepo.list()).length, 1);
  await noteRepo.remove(note.id);
  assert.equal((await noteRepo.list()).length, 0);
  assert.ok(deletedCloudCalls.some((c) => c.collection === 'notes' && c.id === note.id));

  // 4. Trackings
  const track = await trackingRepo.create({ sectionId: 'sec-1', title: 'Tracking à supprimer' });
  assert.equal((await trackingRepo.list()).length, 1);
  await trackingRepo.remove(track.id);
  assert.equal((await trackingRepo.list()).length, 0);
  assert.ok(deletedCloudCalls.some((c) => c.collection === 'trackings' && c.id === track.id));
});

test('AC-03 repository.remove succeeds locally even if remote deletion fails', async () => {
  const seed = new Map();
  const mocks = {
    '@react-native-async-storage/async-storage': {
      default: {
        getItem: async (k) => seed.get(k) ?? null,
        setItem: async (k, v) => seed.set(k, v),
        removeItem: async (k) => seed.delete(k),
      },
      getItem: async (k) => seed.get(k) ?? null,
      setItem: async (k, v) => seed.set(k, v),
      removeItem: async (k) => seed.delete(k),
    },
    'expo-constants': {
      default: { expoConfig: { extra: { storageMode: 'supabase' } } },
    },
    '../config/storageMode': {
      isLocalMode: false,
      storageMode: 'supabase',
    },
    '../services/syncService': {
      deleteItemFromCloud: async () => {
        throw new Error('Network error');
      },
      syncCollectionToCloud: async () => {},
      clearLocalCache: async () => {},
    },
  };

  const loader = createTsLoader(mocks);
  const sectionRepo = loader('src/storage/sectionRepository.ts').sectionRepository;
  const sec = await sectionRepo.create('Section offline');
  assert.equal((await sectionRepo.list()).length, 1);
  // Doit supprimer localement sans lever d'erreur
  await assert.doesNotReject(async () => {
    await sectionRepo.remove(sec.id);
  });
  assert.equal((await sectionRepo.list()).length, 0);
});



import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTypeScript } from './helpers/load-typescript.mjs';

const userId = 'synthetic-user-123';
const keys = {
  sections: '@todo_sections_v1',
  todos: '@todo_todos_v1',
  notes: '@todo_notes_v1',
  tracking_points: '@todo_trackings_v1',
};

const validSection = { id: 'sec-1', name: 'Projets', createdAt: 1700000000000 };
const validTodo = {
  id: 'todo-1',
  sectionId: 'sec-1',
  title: 'Faire les courses',
  done: false,
  priority: 'standard',
  order: 1,
  createdAt: 1700000000000,
};
const validNote = {
  id: 'note-1',
  title: 'Idée',
  description: 'Une note intéressante',
  createdAt: 1700000000000,
};
const validTracking = {
  id: 'track-1',
  sectionId: 'sec-1',
  title: 'Suivi dossier',
  status: 'en_cours',
  nextStep: 'Envoyer email',
  dueDate: '2026-12-31',
  order: 1,
  createdAt: 1700000000000,
};

function setup({ local = false, remoteData = {}, failQuery = false, selectBehavior } = {}) {
  const memory = new Map();
  const remote = {
    sections: remoteData.sections ? [...remoteData.sections] : [],
    todos: remoteData.todos ? [...remoteData.todos] : [],
    notes: remoteData.notes ? [...remoteData.notes] : [],
    tracking_points: remoteData.tracking_points ? [...remoteData.tracking_points] : [],
  };
  const calls = [];

  const client = local
    ? null
    : {
        auth: {
          getSession: async () => ({
            data: { session: { user: { id: userId } } },
            error: null,
          }),
        },
        from(table) {
          const selectedData = [...remote[table]];
          let abortSignal;
          const query = {
            select() {
              return query;
            },
            eq() {
              return query;
            },
            order() {
              return query;
            },
            abortSignal(signal) {
              abortSignal = signal;
              return query;
            },
            async upsert(rows) {
              calls.push({ action: 'upsert', table, rows });
              if (failQuery) {
                return { error: { message: 'Database error' } };
              }
              const list = Array.isArray(rows) ? rows : [rows];
              for (const row of list) {
                const idx = remote[table].findIndex((r) => r.id === row.id);
                if (idx >= 0) remote[table][idx] = { ...remote[table][idx], ...row };
                else remote[table].push(row);
              }
              return { error: null };
            },
            async delete() {
              calls.push({ action: 'delete', table });
              return { error: null };
            },
            then(resolve, reject) {
              calls.push({ action: 'select', table });
              if (selectBehavior) {
                return selectBehavior({ table, data: selectedData, signal: abortSignal, resolve, reject });
              }
              if (failQuery) {
                return Promise.resolve({ data: null, error: { message: 'Network error' } }).then(resolve, reject);
              }
              return Promise.resolve({ data: selectedData, error: null }).then(resolve, reject);
            },
          };
          return query;
        },
      };

  const syncService = loadTypeScript('src/services/syncService.ts', {
    '@react-native-async-storage/async-storage': {
      getItem: async (key) => memory.get(key) ?? null,
      setItem: async (key, val) => {
        memory.set(key, val);
      },
      removeItem: async (key) => {
        memory.delete(key);
      },
    },
    './supabaseClient': { supabase: client },
    './authService': {
      getCurrentUser: async () => (local ? null : { id: userId, email: 'test@example.com' }),
    },
  });

  return { syncService, memory, remote, calls };
}

test('pullFromCloud ignore la réponse obsolète d’un pull annulé après le succès du plus récent', async () => {
  let queryCount = 0;
  const firstPullResolvers = [];
  let firstPullStarted;
  const firstPullReady = new Promise((resolve) => { firstPullStarted = resolve; });
  const { syncService, memory, remote } = setup({
    remoteData: {
      sections: [{ id: 'old', user_id: userId, name: 'Ancienne', created_at: '2026-01-01T00:00:00Z' }],
    },
    selectBehavior: ({ table, data, resolve }) => {
      queryCount += 1;
      if (queryCount <= 4) {
        firstPullResolvers.push(() => resolve({ data, error: null }));
        if (firstPullResolvers.length === 4) firstPullStarted();
        return new Promise(() => {});
      }
      return Promise.resolve({ data: remote[table], error: null }).then(resolve);
    },
  });

  const obsoleteController = new AbortController();
  const obsoletePull = syncService.pullFromCloud(userId, obsoleteController.signal);
  await firstPullReady;
  remote.sections = [{ id: 'new', user_id: userId, name: 'Récente', created_at: '2026-01-02T00:00:00Z' }];

  const currentPull = await syncService.pullFromCloud(userId);
  assert.equal(currentPull.success, true, currentPull.error);
  assert.equal(JSON.parse(memory.get(keys.sections))[0].name, 'Récente');

  obsoleteController.abort();
  firstPullResolvers.forEach((resolve) => resolve());
  const obsoleteResult = await obsoletePull;
  assert.equal(obsoleteResult.success, false);
  assert.equal(JSON.parse(memory.get(keys.sections))[0].name, 'Récente');
});

test('pushToCloud sauvegarde les 4 collections locales vers Supabase avec validation', async () => {
  const { syncService, memory, remote, calls } = setup();

  memory.set(keys.sections, JSON.stringify([validSection]));
  memory.set(keys.todos, JSON.stringify([validTodo]));
  memory.set(keys.notes, JSON.stringify([validNote]));
  memory.set(keys.tracking_points, JSON.stringify([validTracking]));

  const result = await syncService.pushToCloud(userId);
  assert.equal(result.success, true);
  assert.equal(remote.sections.length, 1);
  assert.equal(remote.todos.length, 1);
  assert.equal(remote.notes.length, 1);
  assert.equal(remote.tracking_points.length, 1);

  assert.equal(remote.sections[0].user_id, userId);
  assert.equal(remote.todos[0].user_id, userId);
  assert.equal(calls.filter((c) => c.action === 'upsert').length, 4);
});

test('pushToCloud échoue sans écriture si une collection locale est invalide', async () => {
  const { syncService, memory, calls } = setup();

  memory.set(keys.sections, JSON.stringify([validSection]));
  // Todo avec titre vide (invalide selon TodoSchema)
  memory.set(keys.todos, JSON.stringify([{ ...validTodo, title: '' }]));

  const result = await syncService.pushToCloud(userId);
  assert.equal(result.success, false);
  assert.equal(calls.filter((c) => c.action === 'upsert').length, 0);
});

test('pullFromCloud valide toutes les données distantes avant de toucher au cache local', async () => {
  const remoteSections = [
    {
      id: 'sec-cloud-1',
      user_id: userId,
      name: 'Section Cloud',
      created_at: '2026-10-16T12:00:00Z',
    },
  ];
  const remoteTodos = [
    {
      id: 'todo-cloud-1',
      user_id: userId,
      section_id: 'sec-cloud-1',
      title: 'Tâche Cloud',
      done: false,
      priority: 'urgent',
      order: 0,
      created_at: '2026-10-16T12:00:00Z',
    },
  ];
  const remoteNotes = [
    {
      id: 'note-cloud-1',
      user_id: userId,
      title: 'Note Cloud',
      description: 'Détail',
      created_at: '2026-10-16T12:00:00Z',
    },
  ];
  const remoteTrackings = [
    {
      id: 'track-cloud-1',
      user_id: userId,
      section_id: 'sec-cloud-1',
      title: 'Suivi Cloud',
      status: 'pending',
      next_step: 'Appeler',
      due_date: '2026-11-01',
      order: 0,
      created_at: '2026-10-16T12:00:00Z',
    },
  ];

  const { syncService, memory } = setup({
    remoteData: {
      sections: remoteSections,
      todos: remoteTodos,
      notes: remoteNotes,
      tracking_points: remoteTrackings,
    },
  });

  const res = await syncService.pullFromCloud(userId);
  assert.equal(res.success, true);

  const localSecs = JSON.parse(memory.get(keys.sections));
  const localTodos = JSON.parse(memory.get(keys.todos));
  const localNotes = JSON.parse(memory.get(keys.notes));
  const localTrackings = JSON.parse(memory.get(keys.tracking_points));

  assert.equal(localSecs[0].name, 'Section Cloud');
  assert.equal(localTodos[0].title, 'Tâche Cloud');
  assert.equal(localTodos[0].priority, 'urgent');
  assert.equal(localNotes[0].title, 'Note Cloud');
  assert.equal(localTrackings[0].title, 'Suivi Cloud');
});

test('pullFromCloud préserve le cache existant en cas de données distantes invalides ou corrompues', async () => {
  const initialSection = [{ id: 'sec-preserve', name: 'Preserved', createdAt: 12345 }];
  const { syncService, memory } = setup({
    remoteData: {
      sections: [{ id: 'bad-sec', user_id: userId, name: 12345 /* invalide type */ }],
      todos: [],
      notes: [],
      tracking_points: [],
    },
  });

  memory.set(keys.sections, JSON.stringify(initialSection));

  const res = await syncService.pullFromCloud(userId);
  assert.equal(res.success, false);
  // Le cache local initial n'a PAS été écrasé
  assert.deepEqual(JSON.parse(memory.get(keys.sections)), initialSection);
});

test('syncAll exécute pull puis push et interrompt si pull échoue', async () => {
  const { syncService, memory, calls } = setup({ failQuery: true });
  memory.set(keys.sections, JSON.stringify([validSection]));

  const res = await syncService.syncAll(userId);
  assert.equal(res.success, false);
  assert.equal(calls.filter((c) => c.action === 'upsert').length, 0);
});

test('syncService gère le mode local (client null) sans crash', async () => {
  const { syncService } = setup({ local: true });

  const pushRes = await syncService.pushToCloud(userId);
  assert.equal(pushRes.success, false);
  assert.match(pushRes.error, /configur/i);

  const pullRes = await syncService.pullFromCloud(userId);
  assert.equal(pullRes.success, false);
  assert.match(pullRes.error, /configur/i);
});

test('clearLocalCache purge l\'ensemble des 4 collections et clés legacy du cache local', async () => {
  const { syncService, memory } = setup();
  memory.set(keys.sections, JSON.stringify([validSection]));
  memory.set(keys.todos, JSON.stringify([validTodo]));
  memory.set(keys.notes, JSON.stringify([validNote]));
  memory.set(keys.tracking_points, JSON.stringify([validTracking]));
  memory.set('todo-app:sections', 'legacy-data');

  await syncService.clearLocalCache();

  assert.equal(memory.has(keys.sections), false);
  assert.equal(memory.has(keys.todos), false);
  assert.equal(memory.has(keys.notes), false);
  assert.equal(memory.has(keys.tracking_points), false);
  assert.equal(memory.has('todo-app:sections'), false);
});

test('AC-02 pullFromCloud écrase sainement le cache local et purge les clés legacy hétérogènes existantes', async () => {
  const remoteSections = [
    { id: 'sec-cloud-99', user_id: userId, name: 'Section Distante Cloud', created_at: '2026-10-17T10:00:00Z' },
  ];
  const remoteTodos = [
    {
      id: 'todo-cloud-99',
      user_id: userId,
      section_id: 'sec-cloud-99',
      title: 'Tâche Cloud Supabase',
      done: false,
      priority: 'urgent',
      order: 1,
      created_at: '2026-10-17T10:00:00Z',
    },
  ];

  const { syncService, memory } = setup({
    remoteData: {
      sections: remoteSections,
      todos: remoteTodos,
      notes: [],
      tracking_points: [],
    },
  });

  memory.set('todo-app:sections', JSON.stringify([{ id: 'sec-legacy', name: 'Vieille section', createdAt: '2023-01-01' }]));
  memory.set('todo-app:todos', JSON.stringify([{ id: 't-leg', title: 'Vieux todo', createdAt: '2023-01-01' }]));
  memory.set('todo-app:trackings', JSON.stringify([{ id: 'tr-leg', title: 'Vieux tracking', nextDueDate: '2025-01-01' }]));

  const result = await syncService.pullFromCloud(userId);
  assert.equal(result.success, true);
  assert.match(result.message, /restaur/i);

  const localSecs = JSON.parse(memory.get(keys.sections));
  assert.equal(localSecs.length, 1);
  assert.equal(localSecs[0].name, 'Section Distante Cloud');

  const localTodos = JSON.parse(memory.get(keys.todos));
  assert.equal(localTodos.length, 1);
  assert.equal(localTodos[0].title, 'Tâche Cloud Supabase');
  assert.equal(localTodos[0].priority, 'urgent');

  assert.equal(memory.has('todo-app:sections'), false);
  assert.equal(memory.has('todo-app:todos'), false);
  assert.equal(memory.has('todo-app:trackings'), false);
});



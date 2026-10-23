import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";
import { supabase } from "./supabaseClient";
import { getCurrentUser } from "./authService";
import { readStored, writeStored } from "../storage/validatedStorage";
import {
  Section,
  SectionsSchema,
  Todo,
  TodosSchema,
  Note,
  NotesSchema,
  TrackingPoint,
  TrackingPointsSchema,
  validate,
} from "../types/schemas";
import type {
  SectionInsert,
  TodoInsert,
  NoteInsert,
  TrackingPointInsert,
} from "../types/database";

export interface SyncResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const STORAGE_KEYS = {
  sections: "@todo_sections_v1",
  todos: "@todo_todos_v1",
  notes: "@todo_notes_v1",
  tracking_points: "@todo_trackings_v1",
} as const;

export const LEGACY_KEYS = {
  sections: "todo-app:sections",
  todos: "todo-app:todos",
  notes: "todo-app:notes",
  tracking_points: "todo-app:trackings",
} as const;

// Schémas distants pour validation stricte des données Supabase
const remoteSectionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

const remoteTodoSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  section_id: z.string().nullable().optional(),
  title: z.string(),
  done: z.boolean(),
  priority: z.string().optional(),
  order: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

const remoteNoteSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

const remoteTrackingPointSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  section_id: z.string().nullable().optional(),
  title: z.string(),
  status: z.string().optional(),
  next_step: z.string().optional(),
  due_date: z.string().nullable().optional(),
  order: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

const syncError = () =>
  new Error(
    "Synchronisation impossible. Vos modifications sont conservées dans le cache local ; réessayez lorsque la connexion est rétablie."
  );

let pullCacheWriteQueue: Promise<void> = Promise.resolve();

function throwIfPullAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new Error("Récupération cloud annulée.");
}

function withPullSignal<T>(query: T & { abortSignal: (signal: AbortSignal) => T }, signal?: AbortSignal): T {
  return signal ? query.abortSignal(signal) : query;
}

async function resolveUserId(userId?: string): Promise<string> {
  const id = userId ?? (await getCurrentUser())?.id;
  if (!id) throw new Error("Connectez-vous pour synchroniser vos données.");
  return validate(z.string().min(1), id);
}

/**
 * Envoie les données locales de l'ensemble des 4 collections vers Supabase.
 * Toute donnée locale est validée par Zod avant la moindre écriture réseau.
 */
export async function pushToCloud(userId: string): Promise<SyncResult> {
  if (!supabase) {
    return {
      success: false,
      error: "Supabase n'est pas configuré. Données locales conservées.",
    };
  }

  try {
    const uid = await resolveUserId(userId);

    // 1. Lire et valider les 4 collections locales AVANT tout appel réseau d'écriture
    const localSections = await readStored(STORAGE_KEYS.sections, SectionsSchema, [], LEGACY_KEYS.sections);
    const localTodos = await readStored(STORAGE_KEYS.todos, TodosSchema, [], LEGACY_KEYS.todos);
    const localNotes = await readStored(STORAGE_KEYS.notes, NotesSchema, [], LEGACY_KEYS.notes);
    const localTrackings = await readStored(
      STORAGE_KEYS.tracking_points,
      TrackingPointsSchema,
      [],
      LEGACY_KEYS.tracking_points
    );

    // 2. Préparer les lignes pour Supabase
    const sectionRows: SectionInsert[] = localSections.map((s) => ({
      id: s.id,
      user_id: uid,
      name: s.name,
      created_at: new Date(s.createdAt).toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const todoRows: TodoInsert[] = localTodos.map((t) => ({
      id: t.id,
      user_id: uid,
      section_id: t.sectionId || null,
      title: t.title,
      done: t.done,
      priority: t.priority,
      order: t.order,
      created_at: new Date(t.createdAt).toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const noteRows: NoteInsert[] = localNotes.map((n) => ({
      id: n.id,
      user_id: uid,
      title: n.title,
      description: n.description || "",
      created_at: new Date(n.createdAt).toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const trackingRows: TrackingPointInsert[] = localTrackings.map((p) => ({
      id: p.id,
      user_id: uid,
      section_id: p.sectionId || null,
      title: p.title,
      status: p.status || "",
      next_step: p.nextStep || "",
      due_date: p.dueDate || null,
      order: p.order,
      created_at: new Date(p.createdAt).toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // 3. Envoyer vers Supabase avec upsert
    if (sectionRows.length > 0) {
      const { error } = await supabase.from("sections").upsert(sectionRows, { onConflict: "id" });
      if (error) throw syncError();
    }

    if (todoRows.length > 0) {
      const { error } = await supabase.from("todos").upsert(todoRows, { onConflict: "id" });
      if (error) throw syncError();
    }

    if (noteRows.length > 0) {
      const { error } = await supabase.from("notes").upsert(noteRows, { onConflict: "id" });
      if (error) throw syncError();
    }

    if (trackingRows.length > 0) {
      const { error } = await supabase.from("tracking_points").upsert(trackingRows, { onConflict: "id" });
      if (error) throw syncError();
    }

    return { success: true, message: "Données sauvegardées sur le Cloud avec succès !" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : syncError().message,
    };
  }
}

/**
 * Récupère les données depuis Supabase et met à jour le cache local.
 * L'intégralité des données distantes est validée avec Zod AVANT d'écraser le cache local.
 */
export async function pullFromCloud(userId: string, signal?: AbortSignal): Promise<SyncResult> {
  if (!supabase) {
    return {
      success: false,
      error: "Supabase n'est pas configuré. Données locales conservées.",
    };
  }

  try {
    throwIfPullAborted(signal);
    const uid = await resolveUserId(userId);
    throwIfPullAborted(signal);
    // 1. Récupération parallèle des 4 collections distantes
    const [secRes, todoRes, noteRes, trackRes] = await Promise.all([
      withPullSignal(supabase.from("sections").select("*").eq("user_id", uid).order("created_at", { ascending: true }), signal),
      withPullSignal(supabase.from("todos").select("*").eq("user_id", uid).order("order", { ascending: true }), signal),
      withPullSignal(supabase.from("notes").select("*").eq("user_id", uid).order("created_at", { ascending: true }), signal),
      withPullSignal(supabase.from("tracking_points").select("*").eq("user_id", uid).order("order", { ascending: true }), signal),
    ]);

    throwIfPullAborted(signal);
    if (secRes.error || todoRes.error || noteRes.error || trackRes.error) {
      throw syncError();
    }

    // 2. Validation stricte de chaque réponse distante
    const parsedSections = validate(remoteSectionSchema.array(), secRes.data ?? []);
    const parsedTodos = validate(remoteTodoSchema.array(), todoRes.data ?? []);
    const parsedNotes = validate(remoteNoteSchema.array(), noteRes.data ?? []);
    const parsedTrackings = validate(remoteTrackingPointSchema.array(), trackRes.data ?? []);

    // 3. Transformation en types applicatifs locaux
    const localSections: Section[] = parsedSections.map((s) => ({
      id: s.id,
      name: s.name,
      createdAt: new Date(s.created_at).getTime() || Date.now(),
    }));

    const localTodos: Todo[] = parsedTodos.map((t) => ({
      id: t.id,
      sectionId: t.section_id ?? "",
      title: t.title,
      done: Boolean(t.done),
      priority: t.priority === "urgent" ? "urgent" : "standard",
      order: t.order ?? 0,
      createdAt: new Date(t.created_at).getTime() || Date.now(),
    }));

    const localNotes: Note[] = parsedNotes.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description ?? "",
      createdAt: new Date(n.created_at).getTime() || Date.now(),
    }));

    const localTrackings: TrackingPoint[] = parsedTrackings.map((p) => ({
      id: p.id,
      sectionId: p.section_id ?? "",
      title: p.title,
      status: p.status ?? "",
      nextStep: p.next_step ?? "",
      dueDate: p.due_date || undefined,
      order: p.order ?? 0,
      createdAt: new Date(p.created_at).getTime() || Date.now(),
    }));

    // 4. Validation locale avant la moindre écriture
    validate(SectionsSchema, localSections);
    validate(TodosSchema, localTodos);
    validate(NotesSchema, localNotes);
    validate(TrackingPointsSchema, localTrackings);

    // Serialize cache replacements so a newer pull always writes after an older one.
    let releaseWriteQueue!: () => void;
    const previousWrite = pullCacheWriteQueue;
    pullCacheWriteQueue = new Promise<void>((resolve) => { releaseWriteQueue = resolve; });
    await previousWrite;
    try {
      throwIfPullAborted(signal);
      await Promise.all([
        writeStored(STORAGE_KEYS.sections, SectionsSchema, localSections, undefined, { overwrite: true }),
        writeStored(STORAGE_KEYS.todos, TodosSchema, localTodos, undefined, { overwrite: true }),
        writeStored(STORAGE_KEYS.notes, NotesSchema, localNotes, undefined, { overwrite: true }),
        writeStored(STORAGE_KEYS.tracking_points, TrackingPointsSchema, localTrackings, undefined, { overwrite: true }),
      ]);
    } finally {
      releaseWriteQueue();
    }

    // 6. Nettoyage des anciennes clés legacy devenues inutiles
    await Promise.all(
      Object.values(LEGACY_KEYS).map((k) =>
        AsyncStorage.removeItem(k).catch(() => {})
      )
    );

    return { success: true, message: "Données restaurées depuis le Cloud avec succès !" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : syncError().message,
    };
  }
}

/**
 * Synchronisation bidirectionnelle : pull distant puis push local.
 */
export async function syncAll(userId: string): Promise<SyncResult> {
  const pullResult = await pullFromCloud(userId);
  if (!pullResult.success) {
    return pullResult;
  }
  return pushToCloud(userId);
}

/**
 * Synchronise une collection spécifique vers le cloud en arrière-plan.
 */
export async function syncCollectionToCloud(
  collection: "sections" | "todos" | "notes" | "tracking_points" | string,
  items: unknown[]
): Promise<void> {
  if (!supabase) return;
  const user = await getCurrentUser();
  if (!user) return;

  try {
    if (collection === "sections") {
      const parsed = validate(SectionsSchema, items);
      const rows: SectionInsert[] = parsed.map((s) => ({
        id: s.id,
        user_id: user.id,
        name: s.name,
        created_at: new Date(s.createdAt).toISOString(),
        updated_at: new Date().toISOString(),
      }));
      if (rows.length > 0) await supabase.from("sections").upsert(rows, { onConflict: "id" });
    } else if (collection === "todos") {
      const parsed = validate(TodosSchema, items);
      const rows: TodoInsert[] = parsed.map((t) => ({
        id: t.id,
        user_id: user.id,
        section_id: t.sectionId || null,
        title: t.title,
        done: t.done,
        priority: t.priority,
        order: t.order,
        created_at: new Date(t.createdAt).toISOString(),
        updated_at: new Date().toISOString(),
      }));
      if (rows.length > 0) await supabase.from("todos").upsert(rows, { onConflict: "id" });
    } else if (collection === "notes") {
      const parsed = validate(NotesSchema, items);
      const rows: NoteInsert[] = parsed.map((n) => ({
        id: n.id,
        user_id: user.id,
        title: n.title,
        description: n.description || "",
        created_at: new Date(n.createdAt).toISOString(),
        updated_at: new Date().toISOString(),
      }));
      if (rows.length > 0) await supabase.from("notes").upsert(rows, { onConflict: "id" });
    } else if (collection === "trackings" || collection === "tracking_points") {
      const parsed = validate(TrackingPointsSchema, items);
      const rows: TrackingPointInsert[] = parsed.map((p) => ({
        id: p.id,
        user_id: user.id,
        section_id: p.sectionId || null,
        title: p.title,
        status: p.status || "",
        next_step: p.nextStep || "",
        due_date: p.dueDate || null,
        order: p.order,
        created_at: new Date(p.createdAt).toISOString(),
        updated_at: new Date().toISOString(),
      }));
      if (rows.length > 0) await supabase.from("tracking_points").upsert(rows, { onConflict: "id" });
    }
  } catch (err) {
    console.warn("Échec de synchronisation cloud pour la collection", collection, err);
  }
}

/**
 * Supprime un élément sur Supabase si l'utilisateur est authentifié.
 */
export async function deleteItemFromCloud(
  collection: "sections" | "todos" | "notes" | "tracking_points" | string,
  id: string
): Promise<void> {
  if (!supabase) return;
  const user = await getCurrentUser();
  if (!user) return;

  const tableName =
    collection === "trackings" ? "tracking_points" : (collection as "sections" | "todos" | "notes" | "tracking_points");

  try {
    await supabase.from(tableName).delete().eq("id", id).eq("user_id", user.id);
  } catch (err) {
    console.warn("Échec de suppression cloud pour", collection, id, err);
  }
}

/**
 * Nettoie toutes les collections locales de tâches, sections, notes et suivis.
 * Appelé lors de la déconnexion en mode cloud pour éviter toute fuite de données résiduelles.
 */
export async function clearLocalCache(): Promise<void> {
  const keys = [
    ...Object.values(STORAGE_KEYS),
    ...Object.values(LEGACY_KEYS),
  ];
  await Promise.all(
    keys.map((k) =>
      AsyncStorage.removeItem(k).catch(() => {})
    )
  );
}

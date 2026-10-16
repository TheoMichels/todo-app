import {
  Note,
  NoteInputSchema,
  NoteSchema,
  NoteUpdateSchema,
  validate,
} from "../types/schemas";
import { OfflineStore } from "./db";

export interface NoteRepository {
  list(): Promise<Note[]>;
  get(id: string): Promise<Note | null>;
  create(input: { title: string; description?: string }): Promise<Note>;
  update(id: string, patch: Partial<Pick<Note, "title" | "description">>): Promise<Note>;
  remove(id: string): Promise<void>;
}

const store = new OfflineStore<Note>("notes", NoteSchema);

export const noteRepository: NoteRepository = {
  async list() {
    return await store.load();
  },
  async get(id: string) {
    const all = await store.load();
    return all.find((n) => n.id === id) ?? null;
  },
  async create(input) {
    validate(NoteInputSchema, input);
    const all = await store.loadLocal();
    const newNote: Note = {
      id: Math.random().toString(36).substring(2, 9),
      title: input.title.trim(),
      description: input.description ?? "",
      createdAt: Date.now(),
    };
    validate(NoteSchema, newNote);
    all.push(newNote);
    await store.saveAll(all);
    return newNote;
  },
  async update(id, patch) {
    validate(NoteUpdateSchema, patch);
    const all = await store.loadLocal();
    const index = all.findIndex((n) => n.id === id);
    if (index === -1) throw new Error("Note introuvable");

    const updated: Note = {
      ...all[index],
      ...patch,
      title: patch.title !== undefined ? patch.title.trim() : all[index].title,
    };
    validate(NoteSchema, updated);
    all[index] = updated;
    await store.saveAll(all);
    return updated;
  },
  async remove(id: string) {
    let all = await store.loadLocal();
    all = all.filter((n) => n.id !== id);
    await store.saveAll(all);
  },
};

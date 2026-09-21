import { Note } from "../types/note";
import { NoteRepository } from "./noteRepository";
import { OfflineStore } from "./db";

const store = new OfflineStore<Note>("notes");

export const apiNoteRepository: NoteRepository = {
  async list() {
    return await store.load();
  },
  async create(input) {
    const all = await store.loadLocal();
    const newNote: Note = {
      id: Math.random().toString(36).substring(2, 9),
      title: input.title,
      description: input.description ?? "",
      createdAt: Date.now(),
    };
    all.push(newNote);
    await store.saveAll(all);
    return newNote;
  },
  async update(id, patch) {
    const all = await store.loadLocal();
    const index = all.findIndex(n => n.id === id);
    if (index === -1) throw new Error("Note not found");

    const updated = { ...all[index], ...patch };
    all[index] = updated;
    await store.saveAll(all);
    return updated;
  },
  async remove(id) {
    let all = await store.loadLocal();
    all = all.filter(n => n.id !== id);
    await store.saveAll(all);
  },
};

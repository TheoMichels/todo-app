import { Note } from "../types/note";

export interface NoteRepository {
  list(): Promise<Note[]>;
  create(input: { title: string; description: string }): Promise<Note>;
  update(id: string, patch: Partial<Pick<Note, "title" | "description">>): Promise<Note>;
  remove(id: string): Promise<void>;
}

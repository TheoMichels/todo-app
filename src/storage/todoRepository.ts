import {
  Priority,
  Todo,
  TodoInputSchema,
  TodoSchema,
  TodoUpdateSchema,
  validate,
} from "../types/schemas";
import { OfflineStore } from "./db";

export interface TodoRepository {
  list(params?: { sectionId?: string; done?: boolean }): Promise<Todo[]>;
  get(id: string): Promise<Todo | null>;
  create(input: {
    id?: string;
    sectionId: string;
    title: string;
    priority?: Priority;
    order?: number;
    createdAt?: number;
  }): Promise<Todo>;
  update(
    id: string,
    patch: Partial<Pick<Todo, "title" | "priority" | "done" | "order">>
  ): Promise<Todo>;
  remove(id: string): Promise<void>;
  reorder(ids: string[]): Promise<void>;
}

const store = new OfflineStore<Todo>("todos", TodoSchema);

export const todoRepository: TodoRepository = {
  async list(params) {
    const all = await store.load();
    return all.filter((t) => {
      if (params?.sectionId !== undefined && t.sectionId !== params.sectionId) return false;
      if (params?.done !== undefined && t.done !== params.done) return false;
      return true;
    });
  },
  async get(id: string) {
    const all = await store.load();
    return all.find((t) => t.id === id) ?? null;
  },
  async create(input) {
    validate(TodoInputSchema, input);
    const all = await store.loadLocal();
    const maxOrder = all.reduce((max, t) => Math.max(max, t.order ?? 0), 0);
    const newTodo: Todo = {
      id: input.id ?? Math.random().toString(36).substring(2, 9),
      sectionId: input.sectionId,
      title: input.title.trim(),
      done: false,
      priority: input.priority ?? "standard",
      order: input.order ?? maxOrder + 1,
      createdAt: input.createdAt ?? Date.now(),
    };
    validate(TodoSchema, newTodo);

    const existingIndex = all.findIndex((t) => t.id === newTodo.id);
    if (existingIndex >= 0) {
      all[existingIndex] = newTodo;
    } else {
      all.push(newTodo);
    }
    await store.saveAll(all);
    return newTodo;
  },
  async update(id, patch) {
    validate(TodoUpdateSchema, patch);
    const all = await store.loadLocal();
    const index = all.findIndex((t) => t.id === id);
    if (index === -1) throw new Error("Todo introuvable");

    const updated: Todo = {
      ...all[index],
      ...patch,
      title: patch.title !== undefined ? patch.title.trim() : all[index].title,
    };
    validate(TodoSchema, updated);
    all[index] = updated;
    await store.saveAll(all);
    return updated;
  },
  async remove(id: string) {
    await store.remove(id);
  },
  async reorder(ids: string[]) {
    const all = await store.loadLocal();
    for (let i = 0; i < ids.length; i++) {
      const item = all.find((t) => t.id === ids[i]);
      if (item) {
        item.order = i;
      }
    }
    await store.saveAll(all);
  },
};

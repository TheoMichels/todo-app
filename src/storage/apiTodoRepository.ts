import { Priority, Todo } from "../types/todo";
import { TodoRepository } from "./todoRepository";
import { OfflineStore } from "./db";

const store = new OfflineStore<Todo>("todos");

export const apiTodoRepository: TodoRepository = {
  async list(params) {
    const all = await store.load();
    return all.filter(t => {
      if (params?.sectionId !== undefined && t.sectionId !== params.sectionId) return false;
      if (params?.done !== undefined && t.done !== params.done) return false;
      return true;
    });
  },
  async create(input) {
    const all = await store.loadLocal();
    const maxOrder = all.reduce((max, t) => Math.max(max, t.order ?? 0), 0);
    const newTodo: Todo = {
      id: Math.random().toString(36).substring(2, 9),
      sectionId: input.sectionId,
      title: input.title,
      done: false,
      priority: input.priority ?? "standard",
      order: maxOrder + 1,
      createdAt: Date.now(),
    };
    all.push(newTodo);
    await store.saveAll(all);
    return newTodo;
  },
  async update(id, patch) {
    const all = await store.loadLocal();
    const index = all.findIndex(t => t.id === id);
    if (index === -1) throw new Error("Todo not found");

    const updated = { ...all[index], ...patch };
    all[index] = updated;
    await store.saveAll(all);
    return updated;
  },
  async remove(id) {
    let all = await store.loadLocal();
    all = all.filter(t => t.id !== id);
    await store.saveAll(all);
  },
  async reorder(ids) {
    const all = await store.loadLocal();
    // We only reorder the items provided in the list by assigning them consecutive orders
    for (let i = 0; i < ids.length; i++) {
      const item = all.find(t => t.id === ids[i]);
      if (item) {
        item.order = i;
      }
    }
    await store.saveAll(all);
  },
};

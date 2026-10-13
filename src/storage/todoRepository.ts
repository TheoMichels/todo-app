import { Priority, Todo } from "../types/todo";

export interface TodoRepository {
  list(params?: { sectionId?: string; done?: boolean }): Promise<Todo[]>;
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

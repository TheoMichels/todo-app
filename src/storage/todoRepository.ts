import { Priority, Todo } from "../types/todo";

export interface TodoRepository {
  list(params?: { sectionId?: string; done?: boolean }): Promise<Todo[]>;
  create(input: {
    sectionId: string;
    title: string;
    priority?: Priority;
    dueDate?: number | null;
  }): Promise<Todo>;
  update(
    id: string,
    patch: Partial<Pick<Todo, "title" | "priority" | "dueDate" | "done">>
  ): Promise<Todo>;
  remove(id: string): Promise<void>;
}

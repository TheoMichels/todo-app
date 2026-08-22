import { Todo } from "../types/todo";

export interface TodoRepository {
  getAll(): Promise<Todo[]>;
  save(todos: Todo[]): Promise<void>;
}

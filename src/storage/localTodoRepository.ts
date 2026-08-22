import AsyncStorage from "@react-native-async-storage/async-storage";
import { Todo } from "../types/todo";
import { TodoRepository } from "./todoRepository";

const STORAGE_KEY = "todos";

export const localTodoRepository: TodoRepository = {
  async getAll() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  async save(todos: Todo[]) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  },
};

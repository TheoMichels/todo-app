import { useCallback, useEffect, useState } from "react";
import { Todo } from "../types/todo";
import { todoRepository } from "../storage";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    todoRepository.getAll().then((loaded) => {
      setTodos(loaded);
      setLoading(false);
    });
  }, []);

  const persist = useCallback((next: Todo[]) => {
    setTodos(next);
    todoRepository.save(next);
  }, []);

  const addTodo = useCallback(
    (title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const newTodo: Todo = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: trimmed,
        done: false,
        createdAt: Date.now(),
      };
      persist([newTodo, ...todos]);
    },
    [todos, persist]
  );

  const toggleTodo = useCallback(
    (id: string) => {
      persist(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    },
    [todos, persist]
  );

  const removeTodo = useCallback(
    (id: string) => {
      persist(todos.filter((t) => t.id !== id));
    },
    [todos, persist]
  );

  return { todos, loading, addTodo, toggleTodo, removeTodo };
}

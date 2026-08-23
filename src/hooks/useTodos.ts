import { useCallback, useEffect, useMemo, useState } from "react";
import { Priority, Todo } from "../types/todo";
import { TRASH_SECTION_ID } from "../types/section";
import { todoRepository } from "../storage";

export function useTodos(sectionId: string | undefined) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    todoRepository.getAll().then((loaded) => {
      // Older stored todos predate priority/dueDate; default them so they display correctly.
      const normalized = loaded.map((t) => ({
        priority: "standard" as const,
        dueDate: null,
        ...t,
      }));
      setTodos(normalized);
      setLoading(false);
    });
  }, []);

  const persist = useCallback((next: Todo[]) => {
    setTodos(next);
    todoRepository.save(next);
  }, []);

  const addTodo = useCallback(
    (
      title: string,
      options?: { priority?: Priority; dueDate?: number | null }
    ) => {
      const trimmed = title.trim();
      if (!trimmed || !sectionId || sectionId === TRASH_SECTION_ID) return;
      const newTodo: Todo = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        sectionId,
        title: trimmed,
        done: false,
        priority: options?.priority ?? "standard",
        dueDate: options?.dueDate ?? null,
        createdAt: Date.now(),
      };
      persist([newTodo, ...todos]);
    },
    [todos, persist, sectionId]
  );

  const toggleTodo = useCallback(
    (id: string) => {
      persist(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    },
    [todos, persist]
  );

  const updateTodo = useCallback(
    (id: string, patch: Partial<Pick<Todo, "title" | "priority" | "dueDate">>) => {
      persist(
        todos.map((t) => {
          if (t.id !== id) return t;
          const title = patch.title !== undefined ? patch.title.trim() : t.title;
          return { ...t, ...patch, title: title || t.title };
        })
      );
    },
    [todos, persist]
  );

  const removeTodo = useCallback(
    (id: string) => {
      persist(todos.filter((t) => t.id !== id));
    },
    [todos, persist]
  );

  const sectionTodos = useMemo(() => {
    if (sectionId === TRASH_SECTION_ID) return todos.filter((t) => t.done);
    return todos.filter((t) => t.sectionId === sectionId && !t.done);
  }, [todos, sectionId]);

  return {
    todos: sectionTodos,
    loading,
    addTodo,
    toggleTodo,
    updateTodo,
    removeTodo,
  };
}

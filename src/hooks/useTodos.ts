import { useCallback, useEffect, useMemo, useState } from "react";
import { Priority, Todo } from "../types/todo";
import { TRASH_SECTION_ID } from "../types/section";
import { todoRepository } from "../storage";

export function useTodos(sectionId: string | undefined) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await todoRepository.list();
      setTodos(loaded);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addTodo = useCallback(
    async (
      title: string,
      options?: { priority?: Priority; dueDate?: number | null }
    ) => {
      const trimmed = title.trim();
      if (!trimmed || !sectionId || sectionId === TRASH_SECTION_ID) return;
      const created = await todoRepository.create({
        sectionId,
        title: trimmed,
        priority: options?.priority,
        dueDate: options?.dueDate ?? null,
      });
      setTodos((prev) => [created, ...prev]);
    },
    [sectionId]
  );

  const toggleTodo = useCallback(
    async (id: string) => {
      const current = todos.find((t) => t.id === id);
      if (!current) return;
      const updated = await todoRepository.update(id, { done: !current.done });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    },
    [todos]
  );

  const updateTodo = useCallback(
    async (id: string, patch: Partial<Pick<Todo, "title" | "priority" | "dueDate">>) => {
      const updated = await todoRepository.update(id, patch);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    },
    []
  );

  const removeTodo = useCallback(async (id: string) => {
    await todoRepository.remove(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const sectionTodos = useMemo(() => {
    if (sectionId === TRASH_SECTION_ID) return todos.filter((t) => t.done);
    return todos.filter((t) => t.sectionId === sectionId && !t.done);
  }, [todos, sectionId]);

  return {
    todos: sectionTodos,
    loading,
    error,
    retry: load,
    addTodo,
    toggleTodo,
    updateTodo,
    removeTodo,
  };
}

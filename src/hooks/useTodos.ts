import { useCallback, useEffect, useMemo, useState } from "react";
import { Priority, Todo } from "../types/todo";
import { TRASH_SECTION_ID } from "../types/section";
import { todoRepository } from "../storage";
import { sortTodos } from "../utils/todoSort";

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
      
      const newDone = !current.done;
      // Optimistic update
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: newDone } : t)));
      
      try {
        const updated = await todoRepository.update(id, { done: newDone });
        setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      } catch (e) {
        load();
      }
    },
    [todos, load]
  );

  const updateTodo = useCallback(
    async (id: string, patch: Partial<Pick<Todo, "title" | "priority" | "dueDate">>) => {
      // Optimistic update
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      
      try {
        const updated = await todoRepository.update(id, patch);
        setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      } catch (e) {
        load();
      }
    },
    [load]
  );

  const removeTodo = useCallback(async (id: string) => {
    const previousTodos = todos;
    // Optimistic update
    setTodos((prev) => prev.filter((t) => t.id !== id));
    
    try {
      await todoRepository.remove(id);
    } catch (e) {
      setTodos(previousTodos);
    }
  }, [todos]);

  const sectionTodos = useMemo(() => {
    const filtered =
      sectionId === TRASH_SECTION_ID
        ? todos.filter((t) => t.done)
        : todos.filter((t) => t.sectionId === sectionId && !t.done);
    return sortTodos(filtered);
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

import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutAnimation } from "react-native";
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
      options?: { priority?: Priority }
    ) => {
      const trimmed = title.trim();
      if (!trimmed || !sectionId || sectionId === TRASH_SECTION_ID) return;
      const created = await todoRepository.create({
        sectionId,
        title: trimmed,
        priority: options?.priority,
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
    async (id: string, patch: Partial<Pick<Todo, "title" | "priority">>) => {
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

  const reorderTodos = useCallback(async (ids: string[]) => {
    // Optimistic update
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTodos((prev) => {
      const copy = [...prev];
      for (let i = 0; i < ids.length; i++) {
        const item = copy.find((t) => t.id === ids[i]);
        if (item) item.order = i;
      }
      return copy;
    });

    try {
      await todoRepository.reorder(ids);
    } catch (e) {
      load();
    }
  }, [load]);

  const sectionTodos = useMemo(() => {
    const filtered =
      sectionId === TRASH_SECTION_ID
        ? todos.filter((t) => t.done)
        : todos.filter((t) => t.sectionId === sectionId && !t.done);
    return sortTodos(filtered);
  }, [todos, sectionId]);

  const todoCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of todos) {
      if (!t.done) {
        counts[t.sectionId] = (counts[t.sectionId] || 0) + 1;
      }
    }
    return counts;
  }, [todos]);

  return {
    todos: sectionTodos,
    todoCounts,
    loading,
    error,
    retry: load,
    addTodo,
    toggleTodo,
    updateTodo,
    removeTodo,
    reorderTodos,
  };
}

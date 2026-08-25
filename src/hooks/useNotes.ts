import { useCallback, useEffect, useState } from "react";
import { Note } from "../types/note";
import { noteRepository } from "../storage";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await noteRepository.list();
      setNotes(loaded);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addNote = useCallback(async (title: string, description: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const created = await noteRepository.create({ title: trimmed, description });
    setNotes((prev) => [created, ...prev]);
  }, []);

  const updateNote = useCallback(async (id: string, title: string, description: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const updated = await noteRepository.update(id, { title: trimmed, description });
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
  }, []);

  const removeNote = useCallback(async (id: string) => {
    await noteRepository.remove(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notes, loading, error, retry: load, addNote, updateNote, removeNote };
}

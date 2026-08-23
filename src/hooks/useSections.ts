import { useCallback, useEffect, useState } from "react";
import { Section } from "../types/section";
import { sectionRepository } from "../storage";

export function useSections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await sectionRepository.list();
      if (loaded.length === 0) {
        const defaultSection = await sectionRepository.create("Général");
        setSections([defaultSection]);
      } else {
        setSections(loaded);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addSection = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return undefined;
    const newSection = await sectionRepository.create(trimmed);
    setSections((prev) => [...prev, newSection]);
    return newSection;
  }, []);

  return { sections, loading, error, retry: load, addSection };
}

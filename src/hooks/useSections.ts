import { useCallback, useEffect, useState } from "react";
import { Section } from "../types/section";
import { sectionRepository } from "../storage";

const DEFAULT_SECTION: Section = {
  id: "default",
  name: "Général",
  createdAt: 0,
};

export function useSections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sectionRepository.getAll().then(async (loaded) => {
      if (loaded.length === 0) {
        await sectionRepository.save([DEFAULT_SECTION]);
        setSections([DEFAULT_SECTION]);
      } else {
        setSections(loaded);
      }
      setLoading(false);
    });
  }, []);

  const addSection = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const newSection: Section = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: trimmed,
        createdAt: Date.now(),
      };
      const next = [...sections, newSection];
      setSections(next);
      sectionRepository.save(next);
      return newSection;
    },
    [sections]
  );

  return { sections, loading, addSection };
}

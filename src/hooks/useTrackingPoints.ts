import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutAnimation } from "react-native";
import { TrackingPoint } from "../types/trackingPoint";
import { TRASH_SECTION_ID } from "../types/section";
import { trackingRepository } from "../storage";

type NewTrackingPointData = {
  title: string;
  status: string;
  nextStep: string;
};

export function useTrackingPoints(sectionId: string | undefined) {
  const [points, setPoints] = useState<TrackingPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await trackingRepository.list();
      setPoints(loaded);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addPoint = useCallback(
    async (data: NewTrackingPointData) => {
      if (!sectionId || sectionId === TRASH_SECTION_ID) return;
      const created = await trackingRepository.create({ ...data, sectionId });
      setPoints((prev) => [...prev, created]);
    },
    [sectionId]
  );

  const updatePoint = useCallback(
    async (
      id: string,
      patch: Partial<Pick<TrackingPoint, "title" | "status" | "nextStep">>
    ) => {
      const updated = await trackingRepository.update(id, patch);
      setPoints((prev) => prev.map((p) => (p.id === id ? updated : p)));
    },
    []
  );

  const removePoint = useCallback(async (id: string) => {
    await trackingRepository.remove(id);
    setPoints((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const reorderPoints = useCallback(async (ids: string[]) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPoints((prev) => {
      const copy = [...prev];
      for (let i = 0; i < ids.length; i++) {
        const item = copy.find((t) => t.id === ids[i]);
        if (item) item.order = i;
      }
      return copy;
    });
    try {
      await trackingRepository.reorder(ids);
    } catch (e) {
      load();
    }
  }, [load]);

  const sectionPoints = useMemo(
    () => [...points.filter((p) => p.sectionId === sectionId)].sort((a, b) => {
      if (a.order !== b.order) return (a.order ?? 0) - (b.order ?? 0);
      return a.createdAt - b.createdAt;
    }),
    [points, sectionId]
  );

  return {
    points: sectionPoints,
    loading,
    error,
    retry: load,
    addPoint,
    updatePoint,
    removePoint,
    reorderPoints,
  };
}

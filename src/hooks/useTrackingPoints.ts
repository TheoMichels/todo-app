import { useCallback, useEffect, useMemo, useState } from "react";
import { TrackingPoint } from "../types/trackingPoint";
import { TRASH_SECTION_ID } from "../types/section";
import { trackingRepository } from "../storage";

type NewTrackingPointData = {
  title: string;
  status: string;
  nextStep: string;
  nextDueDate: number | null;
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
      patch: Partial<Pick<TrackingPoint, "title" | "status" | "nextStep" | "nextDueDate">>
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

  const sectionPoints = useMemo(
    () => points.filter((p) => p.sectionId === sectionId),
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
  };
}

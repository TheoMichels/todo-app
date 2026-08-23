import { useCallback, useEffect, useState } from "react";
import { TrackingPoint } from "../types/trackingPoint";
import { trackingRepository } from "../storage";

type NewTrackingPointData = {
  title: string;
  status: string;
  nextStep: string;
  nextDueDate: number | null;
};

export function useTrackingPoints() {
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

  const addPoint = useCallback(async (data: NewTrackingPointData) => {
    const created = await trackingRepository.create(data);
    setPoints((prev) => [...prev, created]);
  }, []);

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

  return { points, loading, error, retry: load, addPoint, updatePoint, removePoint };
}

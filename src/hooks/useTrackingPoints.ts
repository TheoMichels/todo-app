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

  useEffect(() => {
    trackingRepository.getAll().then((loaded) => {
      setPoints(loaded);
      setLoading(false);
    });
  }, []);

  const persist = useCallback((next: TrackingPoint[]) => {
    setPoints(next);
    trackingRepository.save(next);
  }, []);

  const addPoint = useCallback(
    (data: NewTrackingPointData) => {
      const title = data.title.trim();
      if (!title) return;
      const newPoint: TrackingPoint = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title,
        status: data.status.trim(),
        nextStep: data.nextStep.trim(),
        nextDueDate: data.nextDueDate,
        createdAt: Date.now(),
      };
      persist([...points, newPoint]);
    },
    [points, persist]
  );

  const updatePoint = useCallback(
    (
      id: string,
      patch: Partial<Pick<TrackingPoint, "title" | "status" | "nextStep" | "nextDueDate">>
    ) => {
      persist(
        points.map((p) => {
          if (p.id !== id) return p;
          const title = patch.title !== undefined ? patch.title.trim() : p.title;
          return { ...p, ...patch, title: title || p.title };
        })
      );
    },
    [points, persist]
  );

  const removePoint = useCallback(
    (id: string) => {
      persist(points.filter((p) => p.id !== id));
    },
    [points, persist]
  );

  return { points, loading, addPoint, updatePoint, removePoint };
}

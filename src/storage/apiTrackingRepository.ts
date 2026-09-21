import { TrackingPoint } from "../types/trackingPoint";
import { TrackingRepository } from "./trackingRepository";
import { OfflineStore } from "./db";

const store = new OfflineStore<TrackingPoint>("trackings");

export const apiTrackingRepository: TrackingRepository = {
  async list() {
    return await store.load();
  },
  async create(input) {
    const all = await store.loadLocal();
    const newTracking: TrackingPoint = {
      id: Math.random().toString(36).substring(2, 9),
      sectionId: input.sectionId,
      title: input.title,
      status: input.status,
      nextStep: input.nextStep,
      nextDueDate: input.nextDueDate ?? null,
      createdAt: Date.now(),
    };
    all.push(newTracking);
    await store.saveAll(all);
    return newTracking;
  },
  async update(id, patch) {
    const all = await store.loadLocal();
    const index = all.findIndex(t => t.id === id);
    if (index === -1) throw new Error("Tracking not found");

    const updated = { ...all[index], ...patch };
    all[index] = updated;
    await store.saveAll(all);
    return updated;
  },
  async remove(id) {
    let all = await store.loadLocal();
    all = all.filter(t => t.id !== id);
    await store.saveAll(all);
  },
};

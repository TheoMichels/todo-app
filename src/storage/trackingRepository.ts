import {
  TrackingPoint,
  TrackingPointInputSchema,
  TrackingPointSchema,
  TrackingPointUpdateSchema,
  validate,
} from "../types/schemas";
import { OfflineStore } from "./db";

export interface TrackingRepository {
  list(): Promise<TrackingPoint[]>;
  get(id: string): Promise<TrackingPoint | null>;
  create(input: {
    sectionId: string;
    title: string;
    status?: string;
    nextStep?: string;
    dueDate?: string;
  }): Promise<TrackingPoint>;
  update(
    id: string,
    patch: Partial<Pick<TrackingPoint, "title" | "status" | "nextStep" | "order" | "dueDate">>
  ): Promise<TrackingPoint>;
  remove(id: string): Promise<void>;
  reorder(ids: string[]): Promise<void>;
}

const store = new OfflineStore<TrackingPoint>("trackings", TrackingPointSchema);

export const trackingRepository: TrackingRepository = {
  async list() {
    return await store.load();
  },
  async get(id: string) {
    const all = await store.load();
    return all.find((t) => t.id === id) ?? null;
  },
  async create(input) {
    validate(TrackingPointInputSchema, input);
    const all = await store.loadLocal();
    const maxOrder = all.reduce((max, t) => Math.max(max, t.order ?? 0), 0);
    const newTracking: TrackingPoint = {
      id: Math.random().toString(36).substring(2, 9),
      sectionId: input.sectionId,
      title: input.title.trim(),
      status: input.status ?? "",
      nextStep: input.nextStep ?? "",
      dueDate: input.dueDate,
      order: maxOrder + 1,
      createdAt: Date.now(),
    };
    validate(TrackingPointSchema, newTracking);
    all.push(newTracking);
    await store.saveAll(all);
    return newTracking;
  },
  async update(id, patch) {
    validate(TrackingPointUpdateSchema, patch);
    const all = await store.loadLocal();
    const index = all.findIndex((t) => t.id === id);
    if (index === -1) throw new Error("Tracking introuvable");

    const updated: TrackingPoint = {
      ...all[index],
      ...patch,
      title: patch.title !== undefined ? patch.title.trim() : all[index].title,
    };
    validate(TrackingPointSchema, updated);
    all[index] = updated;
    await store.saveAll(all);
    return updated;
  },
  async remove(id: string) {
    await store.remove(id);
  },
  async reorder(ids: string[]) {
    const all = await store.loadLocal();
    for (let i = 0; i < ids.length; i++) {
      const item = all.find((t) => t.id === ids[i]);
      if (item) {
        item.order = i;
      }
    }
    await store.saveAll(all);
  },
};

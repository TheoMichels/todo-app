import { Section, SectionInputSchema, SectionSchema, validate } from "../types/schemas";
import { OfflineStore } from "./db";

export interface SectionRepository {
  list(): Promise<Section[]>;
  get(id: string): Promise<Section | null>;
  create(name: string): Promise<Section>;
  update(id: string, name: string): Promise<Section>;
  remove(id: string): Promise<void>;
}

const store = new OfflineStore<Section>("sections", SectionSchema);

export const sectionRepository: SectionRepository = {
  async list() {
    return await store.load();
  },
  async get(id: string) {
    const all = await store.load();
    return all.find((s) => s.id === id) ?? null;
  },
  async create(name: string) {
    validate(SectionInputSchema, { name });
    const all = await store.loadLocal();
    const newSection: Section = {
      id: Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      createdAt: Date.now(),
    };
    validate(SectionSchema, newSection);
    all.push(newSection);
    await store.saveAll(all);
    return newSection;
  },
  async update(id: string, name: string) {
    validate(SectionInputSchema, { name });
    const all = await store.loadLocal();
    const index = all.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Section introuvable");

    const updated: Section = { ...all[index], name: name.trim() };
    validate(SectionSchema, updated);
    all[index] = updated;
    await store.saveAll(all);
    return updated;
  },
  async remove(id: string) {
    const all = await store.loadLocal();
    const filtered = all.filter((s) => s.id !== id);
    await store.saveAll(filtered);
  },
};

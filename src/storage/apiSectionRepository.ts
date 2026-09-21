import { Section } from "../types/section";
import { SectionRepository } from "./sectionRepository";
import { OfflineStore } from "./db";

const store = new OfflineStore<Section>("sections");

export const apiSectionRepository: SectionRepository = {
  async list() {
    return await store.load();
  },
  async create(name) {
    const all = await store.loadLocal();
    const newSection: Section = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      createdAt: Date.now(),
    };
    all.push(newSection);
    await store.saveAll(all);
    return newSection;
  },
  async update(id, name) {
    const all = await store.loadLocal();
    const index = all.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Section not found");

    const updated = { ...all[index], name };
    all[index] = updated;
    await store.saveAll(all);
    return updated;
  },
};

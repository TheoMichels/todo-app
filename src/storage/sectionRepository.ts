import { Section } from "../types/section";

export interface SectionRepository {
  list(): Promise<Section[]>;
  create(name: string): Promise<Section>;
  update(id: string, name: string): Promise<Section>;
}

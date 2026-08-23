import { Section } from "../types/section";

export interface SectionRepository {
  list(): Promise<Section[]>;
  create(name: string): Promise<Section>;
}

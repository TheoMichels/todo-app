import { Section } from "../types/section";

export interface SectionRepository {
  getAll(): Promise<Section[]>;
  save(sections: Section[]): Promise<void>;
}

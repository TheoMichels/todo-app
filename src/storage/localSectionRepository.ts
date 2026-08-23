import AsyncStorage from "@react-native-async-storage/async-storage";
import { Section } from "../types/section";
import { SectionRepository } from "./sectionRepository";

const STORAGE_KEY = "sections";

export const localSectionRepository: SectionRepository = {
  async getAll() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  async save(sections: Section[]) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
  },
};

import AsyncStorage from "@react-native-async-storage/async-storage";
import { TrackingPoint } from "../types/trackingPoint";
import { TrackingRepository } from "./trackingRepository";

const STORAGE_KEY = "trackingPoints";

export const localTrackingRepository: TrackingRepository = {
  async getAll() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  async save(points: TrackingPoint[]) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(points));
  },
};

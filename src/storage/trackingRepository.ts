import { TrackingPoint } from "../types/trackingPoint";

export interface TrackingRepository {
  getAll(): Promise<TrackingPoint[]>;
  save(points: TrackingPoint[]): Promise<void>;
}

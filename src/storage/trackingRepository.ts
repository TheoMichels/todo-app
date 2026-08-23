import { TrackingPoint } from "../types/trackingPoint";

export interface TrackingRepository {
  list(): Promise<TrackingPoint[]>;
  create(input: {
    title: string;
    status: string;
    nextStep: string;
    nextDueDate: number | null;
  }): Promise<TrackingPoint>;
  update(
    id: string,
    patch: Partial<Pick<TrackingPoint, "title" | "status" | "nextStep" | "nextDueDate">>
  ): Promise<TrackingPoint>;
  remove(id: string): Promise<void>;
}

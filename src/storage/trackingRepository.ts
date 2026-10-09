import { TrackingPoint } from "../types/trackingPoint";

export interface TrackingRepository {
  list(): Promise<TrackingPoint[]>;
  create(input: {
    sectionId: string;
    title: string;
    status: string;
    nextStep: string;
    dueDate?: string;
  }): Promise<TrackingPoint>;
  update(
    id: string,
    patch: Partial<Pick<TrackingPoint, "title" | "status" | "nextStep" | "order" | "dueDate">>
  ): Promise<TrackingPoint>;
  remove(id: string): Promise<void>;
  reorder(ids: string[]): Promise<void>;
}

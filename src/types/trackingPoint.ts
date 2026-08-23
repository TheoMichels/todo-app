export type TrackingPoint = {
  id: string;
  title: string;
  status: string;
  nextStep: string;
  nextDueDate: number | null;
  createdAt: number;
};

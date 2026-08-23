export type TrackingPoint = {
  id: string;
  sectionId: string;
  title: string;
  status: string;
  nextStep: string;
  nextDueDate: number | null;
  createdAt: number;
};

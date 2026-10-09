export type TrackingPoint = {
  id: string;
  sectionId: string;
  title: string;
  status: string;
  nextStep: string;
  dueDate?: string;
  order: number;
  createdAt: number;
};

export type Priority = "standard" | "urgent";

export type Todo = {
  id: string;
  sectionId: string;
  title: string;
  done: boolean;
  priority: Priority;
  dueDate: number | null;
  createdAt: number;
};

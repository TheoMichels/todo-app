import { Todo } from "../types/todo";

// Order: urgent, standard
function rank(todo: Todo): number {
  return todo.priority === "urgent" ? 0 : 1;
}

export function sortTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    const rA = rank(a);
    const rB = rank(b);
    if (rA !== rB) return rA - rB;
    if (a.order !== b.order) return (a.order ?? 0) - (b.order ?? 0);
    return a.createdAt - b.createdAt;
  });
}

import { Todo } from "../types/todo";

// Order: urgent w/o due date, urgent w/ due date (soonest first),
// standard w/o due date, standard w/ due date (soonest first).
function rank(todo: Todo): number {
  const hasDueDate = todo.dueDate != null;
  if (todo.priority === "urgent") return hasDueDate ? 1 : 0;
  return hasDueDate ? 3 : 2;
}

export function sortTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    const diff = rank(a) - rank(b);
    if (diff !== 0) return diff;
    if (a.dueDate != null && b.dueDate != null) {
      return a.dueDate - b.dueDate;
    }
    return 0;
  });
}

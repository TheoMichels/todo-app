import { Priority, Todo } from "../types/todo";
import { TodoRepository } from "./todoRepository";
import { apiRequest } from "../api/client";
import { dateFromApi, dateTimeFromApi, dateToApi } from "../api/dates";

type TodoDto = {
  id: string;
  sectionId: string;
  title: string;
  done: boolean;
  priority: Priority;
  dueDate: string | null;
  createdAt: string;
};

function fromDto(dto: TodoDto): Todo {
  return {
    id: dto.id,
    sectionId: dto.sectionId,
    title: dto.title,
    done: dto.done,
    priority: dto.priority,
    dueDate: dateFromApi(dto.dueDate),
    createdAt: dateTimeFromApi(dto.createdAt),
  };
}

export const apiTodoRepository: TodoRepository = {
  async list(params) {
    const dtos = await apiRequest<TodoDto[]>("/todos", { params });
    return dtos.map(fromDto);
  },

  async create(input) {
    const dto = await apiRequest<TodoDto>("/todos", {
      method: "POST",
      body: {
        sectionId: input.sectionId,
        title: input.title,
        priority: input.priority,
        dueDate: dateToApi(input.dueDate ?? null),
      },
    });
    return fromDto(dto);
  },

  async update(id, patch) {
    const body: Record<string, unknown> = {};
    if (patch.title !== undefined) body.title = patch.title;
    if (patch.priority !== undefined) body.priority = patch.priority;
    if (patch.dueDate !== undefined) body.dueDate = dateToApi(patch.dueDate);
    if (patch.done !== undefined) body.done = patch.done;

    const dto = await apiRequest<TodoDto>(`/todos/${id}`, { method: "PATCH", body });
    return fromDto(dto);
  },

  async remove(id) {
    await apiRequest<void>(`/todos/${id}`, { method: "DELETE" });
  },
};

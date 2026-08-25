import { Note } from "../types/note";
import { NoteRepository } from "./noteRepository";
import { apiRequest } from "../api/client";
import { dateTimeFromApi } from "../api/dates";

type NoteDto = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
};

function fromDto(dto: NoteDto): Note {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description ?? "",
    createdAt: dateTimeFromApi(dto.createdAt),
  };
}

export const apiNoteRepository: NoteRepository = {
  async list() {
    const dtos = await apiRequest<NoteDto[]>("/notes");
    return dtos.map(fromDto);
  },

  async create(input) {
    const dto = await apiRequest<NoteDto>("/notes", {
      method: "POST",
      body: { title: input.title, description: input.description },
    });
    return fromDto(dto);
  },

  async update(id, patch) {
    const dto = await apiRequest<NoteDto>(`/notes/${id}`, {
      method: "PATCH",
      body: { title: patch.title, description: patch.description },
    });
    return fromDto(dto);
  },

  async remove(id) {
    await apiRequest<void>(`/notes/${id}`, { method: "DELETE" });
  },
};

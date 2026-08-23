import { Section } from "../types/section";
import { SectionRepository } from "./sectionRepository";
import { apiRequest } from "../api/client";
import { dateTimeFromApi } from "../api/dates";

type SectionDto = {
  id: string;
  name: string;
  createdAt: string;
};

function fromDto(dto: SectionDto): Section {
  return { id: dto.id, name: dto.name, createdAt: dateTimeFromApi(dto.createdAt) };
}

export const apiSectionRepository: SectionRepository = {
  async list() {
    const dtos = await apiRequest<SectionDto[]>("/sections");
    return dtos.map(fromDto);
  },

  async create(name) {
    const dto = await apiRequest<SectionDto>("/sections", {
      method: "POST",
      body: { name },
    });
    return fromDto(dto);
  },
};

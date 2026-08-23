import { TrackingPoint } from "../types/trackingPoint";
import { TrackingRepository } from "./trackingRepository";
import { apiRequest } from "../api/client";
import { dateFromApi, dateTimeFromApi, dateToApi } from "../api/dates";

type TrackingPointDto = {
  id: string;
  sectionId: string;
  title: string;
  status: string;
  nextStep: string;
  nextDueDate: string | null;
  createdAt: string;
};

function fromDto(dto: TrackingPointDto): TrackingPoint {
  return {
    id: dto.id,
    sectionId: dto.sectionId,
    title: dto.title,
    status: dto.status,
    nextStep: dto.nextStep,
    nextDueDate: dateFromApi(dto.nextDueDate),
    createdAt: dateTimeFromApi(dto.createdAt),
  };
}

export const apiTrackingRepository: TrackingRepository = {
  async list() {
    const dtos = await apiRequest<TrackingPointDto[]>("/tracking-points");
    return dtos.map(fromDto);
  },

  async create(input) {
    const dto = await apiRequest<TrackingPointDto>("/tracking-points", {
      method: "POST",
      body: {
        sectionId: input.sectionId,
        title: input.title,
        status: input.status,
        nextStep: input.nextStep,
        nextDueDate: dateToApi(input.nextDueDate),
      },
    });
    return fromDto(dto);
  },

  async update(id, patch) {
    const body: Record<string, unknown> = {};
    if (patch.title !== undefined) body.title = patch.title;
    if (patch.status !== undefined) body.status = patch.status;
    if (patch.nextStep !== undefined) body.nextStep = patch.nextStep;
    if (patch.nextDueDate !== undefined) body.nextDueDate = dateToApi(patch.nextDueDate);

    const dto = await apiRequest<TrackingPointDto>(`/tracking-points/${id}`, {
      method: "PATCH",
      body,
    });
    return fromDto(dto);
  },

  async remove(id) {
    await apiRequest<void>(`/tracking-points/${id}`, { method: "DELETE" });
  },
};

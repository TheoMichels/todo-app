import { localTodoRepository } from "./localTodoRepository";
import { localSectionRepository } from "./localSectionRepository";
import { localTrackingRepository } from "./localTrackingRepository";

// Swap these for API-backed repositories once the backend exists.
export const todoRepository = localTodoRepository;
export const sectionRepository = localSectionRepository;
export const trackingRepository = localTrackingRepository;

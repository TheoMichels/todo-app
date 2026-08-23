import { localTodoRepository } from "./localTodoRepository";
import { localSectionRepository } from "./localSectionRepository";

// Swap these for API-backed repositories once the backend exists.
export const todoRepository = localTodoRepository;
export const sectionRepository = localSectionRepository;

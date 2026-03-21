import { db } from "./db";
import { createIntentionService, createNoteService } from "./services";
import { createGoalService } from "./services/goal-service";
import { createTaskService } from "./services/tasks-service";

export const noteService = createNoteService(db);
export const taskService = createTaskService(db);
export const intentionService = createIntentionService(db);
export const goalService = createGoalService(db);

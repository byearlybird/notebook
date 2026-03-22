import { db } from "./db";
import {
  createEntryService,
  createGoalService,
  createIntentionService,
  createNoteService,
  createTaskService,
} from "./services";

export const noteService = createNoteService(db);
export const taskService = createTaskService(db);
export const intentionService = createIntentionService(db);
export const goalService = createGoalService(db);
export const entryService = createEntryService(db);

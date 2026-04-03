import { db } from "./db";
import { createEntryRepo } from "./repos/entry-repo";
import { createLabelRepo } from "./repos/label-repo";
import {
  createEntryService,
  createIntentionService,
  createLabelService,
  createNoteService,
  createTaskService,
} from "./services";

const entryRepo = createEntryRepo(db);
const labelRepo = createLabelRepo(db);

export const noteService = createNoteService(entryRepo, labelRepo);
export const taskService = createTaskService(entryRepo, labelRepo);
export const intentionService = createIntentionService(entryRepo);
export const entryService = createEntryService(entryRepo, labelRepo);
export const labelService = createLabelService(labelRepo);

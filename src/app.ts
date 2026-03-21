import { db } from "./db";
import { createNoteService } from "./services";

export const noteService = createNoteService(db);

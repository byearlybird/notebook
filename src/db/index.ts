import { createStorage } from "./storage";
import { createClock } from "./clock";
import { createRepo } from "./repos";
import { noteSchema, taskSchema } from "./schema";

export const storage = createStorage({ dbName: "notebook_crdt", tableName: "app_data" });
export const clock = createClock(storage);
export const notesRepo = createRepo(storage, clock, "note", noteSchema, "id");
export const tasksRepo = createRepo(storage, clock, "task", taskSchema, "id");

export * from "./schema";

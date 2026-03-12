import { createStorage } from "./storage";

export * from "./repos";
export * from "./schema";

export const storage = createStorage({ dbName: "notebook-3-crdt", tableName: "entries" });

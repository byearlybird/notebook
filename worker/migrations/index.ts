import { M001_init } from "./001.init";

export type Migration = {
  up: (db: D1Database) => Promise<void>;
};

export const migrations: Record<string, Migration> = {
  "2024-01-01": M001_init,
};

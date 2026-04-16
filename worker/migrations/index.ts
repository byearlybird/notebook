import { M001_init } from "./001.init";
import { M002_user_keys } from "./002.user-keys";

export type Migration = {
  up: (db: D1Database) => Promise<void>;
};

export const migrations: Record<string, Migration> = {
  "2024-01-01": M001_init,
  "2024-01-02": M002_user_keys,
};

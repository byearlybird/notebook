import type { Migration } from "./index";

export const M002_user_keys: Migration = {
  async up(db: D1Database) {
    await db
      .prepare(
        `CREATE TABLE IF NOT EXISTS user_keys (
          user_id     TEXT NOT NULL PRIMARY KEY,
          wrapped_key TEXT NOT NULL,
          salt        TEXT NOT NULL,
          iv          TEXT NOT NULL,
          created_at  TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
        )`,
      )
      .run();
  },
};

import type { Migration } from "./index";

export const M001_init: Migration = {
  async up(db: D1Database) {
    await db.exec(
      "CREATE TABLE IF NOT EXISTS changes (seq INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, cyphertext TEXT NOT NULL)",
    );
  },
};

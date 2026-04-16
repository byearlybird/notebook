// oxlint-disable typescript/no-explicit-any
import { sql } from "kysely";
import type { Kysely, Migration } from "kysely";
import { createSyncTable } from "./sync-helpers";

export const M001_init: Migration = {
  async up(db: Kysely<any>) {
    // 1. client_state — singleton row holds the local clock and node identity
    await sql`
      CREATE TABLE IF NOT EXISTS client_state (
        id      INTEGER PRIMARY KEY CHECK (id = 1),
        last_server_seq INTEGER NOT NULL DEFAULT 0,
        clock   INTEGER NOT NULL DEFAULT 0,
        node_id TEXT    NOT NULL DEFAULT (hex(randomblob(16)))
      )
    `.execute(db);

    await sql`INSERT OR IGNORE INTO client_state (id) VALUES (1)`.execute(db);

    // 2. sync_changes — outbox tracking unpushed rows
    await db.schema
      .createTable("sync_changes")
      .ifNotExists()
      .addColumn("table_name", "text", (cb) => cb.notNull())
      .addColumn("row_id", "text", (cb) => cb.notNull())
      .addColumn("clock", "integer", (cb) => cb.notNull())
      .addPrimaryKeyConstraint("sync_changes_pk", ["table_name", "row_id"])
      .execute();

    // 3. notes
    await createSyncTable(db, "notes", (t) =>
      t
        .addColumn("id", "text", (cb) => cb.primaryKey())
        .addColumn("content", "text", (cb) => cb.notNull())
        .addColumn("created_at", "text", (cb) => cb.notNull())
        .addColumn("edited_at", "text", (cb) => cb.defaultTo(null))
        .addColumn("status", "text", (cb) => cb.defaultTo(null)),
    );
  },
};

import { sql } from "kysely";
import type { Kysely, Migration } from "kysely";
import { createSyncTable } from "./sync-helpers";

export const M002_schema: Migration = {
  async up(db: Kysely<any>) {
    await createSyncTable(db, "notes", (t) =>
      t
        .addColumn("id", "text", (cb) => cb.primaryKey())
        .addColumn("content", "text", (cb) => cb.notNull())
        .addColumn("date", "text", (cb) => cb.notNull())
        .addColumn("created_at", "text", (cb) => cb.notNull())
        .addColumn("content_edited_at", "text", (cb) => cb.defaultTo(null))
        .addColumn("label", "text", (cb) => cb.defaultTo(null))
        .addColumn("pinned", "integer", (cb) => cb.notNull().defaultTo(0)),
    );

    await createSyncTable(db, "tasks", (t) =>
      t
        .addColumn("id", "text", (cb) => cb.primaryKey())
        .addColumn("content", "text", (cb) => cb.notNull())
        .addColumn("date", "text", (cb) => cb.notNull())
        .addColumn("status", "text", (cb) => cb.notNull().defaultTo("incomplete"))
        .addColumn("created_at", "text", (cb) => cb.notNull())
        .addColumn("content_edited_at", "text", (cb) => cb.defaultTo(null))
        .addColumn("label", "text", (cb) => cb.defaultTo(null)),
    );

    await createSyncTable(db, "intentions", (t) =>
      t
        .addColumn("id", "text", (cb) => cb.primaryKey())
        .addColumn("content", "text", (cb) => cb.notNull())
        .addColumn("month", "text", (cb) => cb.notNull())
        .addColumn("created_at", "text", (cb) => cb.notNull())
        .addColumn("content_edited_at", "text", (cb) => cb.defaultTo(null)),
    );

    await createSyncTable(db, "labels", (t) =>
      t
        .addColumn("id", "text", (cb) => cb.primaryKey())
        .addColumn("name", "text", (cb) => cb.notNull()),
    );

    await sql`
      CREATE VIEW IF NOT EXISTS timeline AS
      SELECT id, 'note' AS type, content, created_at, NULL AS status, pinned FROM notes WHERE is_deleted = 0
      UNION ALL
      SELECT id, 'task' AS type, content, created_at, status, 0 AS pinned FROM tasks WHERE is_deleted = 0
    `.execute(db);
  },
};

// oxlint-disable typescript/no-explicit-any
import { sql } from "kysely";
import type { CreateTableBuilder, Kysely } from "kysely";

/**
 * Creates a synced table with the standard sync-metadata columns
 * (is_deleted, hlc) and installs the three triggers:
 *   INSERT  — stamps hlc when hlc IS NULL (local write)
 *   UPDATE  — re-stamps when hlc hasn't changed (local edit); sync
 *             UPSERTs that supply a new hlc bypass this automatically
 *   BEFORE DELETE — converts hard-deletes to soft-deletes (is_deleted = 1)
 *
 * The hlc column stores a lexicographically-sortable string:
 *   printf('%015d', hlc_wall) || '@' || printf('%08d', hlc_count) || '@' || node_id
 *
 * Usage:
 *   await createSyncTable(db, "tags", (t) =>
 *     t
 *       .addColumn("id", "text", (cb) => cb.primaryKey())
 *       .addColumn("name", "text", (cb) => cb.notNull())
 *   );
 */
export async function createSyncTable(
  db: Kysely<any>,
  tableName: string,
  configure: (builder: CreateTableBuilder<typeof tableName, never>) => CreateTableBuilder<any, any>,
): Promise<void> {
  await configure(db.schema.createTable(tableName).ifNotExists())
    .addColumn("is_deleted", "integer", (cb) => cb.notNull().defaultTo(0))
    .addColumn("hlc", "text", (cb) => cb.defaultTo(null))
    .execute();

  // Local-tick helper: advances hlc_wall/hlc_count in client_state then stamps the row.
  // Shared by both the insert and update triggers.
  const localTickBody = sql.raw(`
      UPDATE client_state SET
        hlc_count = CASE
          WHEN CAST(unixepoch('now', 'subsec') * 1000 AS INTEGER) > hlc_wall
            THEN 0
          ELSE hlc_count + 1
        END,
        hlc_wall = MAX(hlc_wall, CAST(unixepoch('now', 'subsec') * 1000 AS INTEGER))
      WHERE id = 1;
      UPDATE ${tableName}
         SET hlc = (
               printf('%015d', (SELECT hlc_wall FROM client_state WHERE id = 1))
               || '@' ||
               printf('%08d', (SELECT hlc_count FROM client_state WHERE id = 1))
               || '@' ||
               (SELECT node_id FROM client_state WHERE id = 1)
             )
       WHERE id = NEW.id;
      INSERT INTO sync_changes (table_name, row_id, hlc)
        VALUES ('${tableName}', NEW.id, (SELECT hlc FROM ${tableName} WHERE id = NEW.id))
        ON CONFLICT(table_name, row_id) DO UPDATE SET hlc = excluded.hlc;
  `);

  await sql`
    CREATE TRIGGER IF NOT EXISTS ${sql.raw(tableName)}_after_insert
    AFTER INSERT ON ${sql.raw(tableName)}
    WHEN NEW.hlc IS NULL
    BEGIN
      ${localTickBody}
    END
  `.execute(db);

  await sql`
    CREATE TRIGGER IF NOT EXISTS ${sql.raw(tableName)}_after_update
    AFTER UPDATE ON ${sql.raw(tableName)}
    WHEN NEW.hlc IS OLD.hlc
    BEGIN
      ${localTickBody}
    END
  `.execute(db);

  await sql`
    CREATE TRIGGER IF NOT EXISTS ${sql.raw(tableName)}_before_delete
    BEFORE DELETE ON ${sql.raw(tableName)}
    BEGIN
      UPDATE ${sql.raw(tableName)} SET is_deleted = 1 WHERE id = OLD.id;
      SELECT RAISE(IGNORE);
    END
  `.execute(db);
}

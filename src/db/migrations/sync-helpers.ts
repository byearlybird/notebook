// oxlint-disable typescript/no-explicit-any
import { sql } from "kysely";
import type { CreateTableBuilder, Kysely } from "kysely";

/**
 * Creates a synced table with the standard sync-metadata columns
 * (is_deleted, clock, node_id) and installs the three triggers:
 *   INSERT  — stamps clock + node_id when clock IS NULL (local write)
 *   UPDATE  — re-stamps when clock hasn't changed (local edit); sync
 *             UPSERTs that supply a new clock bypass this automatically
 *   BEFORE DELETE — converts hard-deletes to soft-deletes (is_deleted = 1)
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
    .addColumn("clock", "integer", (cb) => cb.defaultTo(null))
    .addColumn("node_id", "text", (cb) => cb.defaultTo(null))
    .execute();

  await sql`
    CREATE TRIGGER IF NOT EXISTS ${sql.raw(tableName)}_after_insert
    AFTER INSERT ON ${sql.raw(tableName)}
    WHEN NEW.clock IS NULL
    BEGIN
      UPDATE client_state SET clock = clock + 1 WHERE id = 1;
      UPDATE ${sql.raw(tableName)}
         SET clock   = (SELECT clock   FROM client_state WHERE id = 1),
             node_id   = (SELECT node_id FROM client_state WHERE id = 1)
       WHERE id = NEW.id;
      INSERT INTO sync_changes (table_name, row_id, clock)
        VALUES (${sql.lit(tableName)}, NEW.id, (SELECT clock FROM client_state WHERE id = 1))
        ON CONFLICT(table_name, row_id) DO UPDATE SET clock = excluded.clock;
    END
  `.execute(db);

  await sql`
    CREATE TRIGGER IF NOT EXISTS ${sql.raw(tableName)}_after_update
    AFTER UPDATE ON ${sql.raw(tableName)}
    WHEN NEW.clock IS OLD.clock
    BEGIN
      UPDATE client_state SET clock = clock + 1 WHERE id = 1;
      UPDATE ${sql.raw(tableName)}
         SET clock   = (SELECT clock   FROM client_state WHERE id = 1),
             node_id   = (SELECT node_id FROM client_state WHERE id = 1)
       WHERE id = NEW.id;
      INSERT INTO sync_changes (table_name, row_id, clock)
        VALUES (${sql.lit(tableName)}, NEW.id, (SELECT clock FROM client_state WHERE id = 1))
        ON CONFLICT(table_name, row_id) DO UPDATE SET clock = excluded.clock;
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

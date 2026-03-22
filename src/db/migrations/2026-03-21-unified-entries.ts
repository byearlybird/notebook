import { type Kysely, type Migration, sql } from "kysely";

export const Migration20260321UnifiedEntries: Migration = {
  async up(db: Kysely<any>) {
    await db.schema
      .createTable("entries")
      .addColumn("id", "text", (cb) => cb.primaryKey())
      .addColumn("date", "text", (cb) => cb.notNull())
      .addColumn("content", "text", (cb) => cb.notNull())
      .addColumn("createdAt", "text", (cb) => cb.notNull())
      .addColumn("updatedAt", "text", (cb) => cb.notNull())
      .addColumn("type", "text", (cb) => cb.notNull())
      .addColumn("status", "text")
      .addColumn("originId", "text")
      .execute();

    // Migrate notes
    await sql`
      INSERT INTO entries (id, date, content, createdAt, updatedAt, type, status, originId)
      SELECT id, date, content, created_at, updated_at, 'note', NULL, NULL
      FROM notes
    `.execute(db);

    // Migrate tasks
    await sql`
      INSERT INTO entries (id, date, content, createdAt, updatedAt, type, status, originId)
      SELECT id, date, content, created_at, updated_at, 'task', status, original_id
      FROM tasks
    `.execute(db);

    // Migrate intentions
    await sql`
      INSERT INTO entries (id, date, content, createdAt, updatedAt, type, status, originId)
      SELECT id, month, content, created_at, updated_at, 'intention', NULL, NULL
      FROM intentions
    `.execute(db);

    // Migrate goals
    await sql`
      INSERT INTO entries (id, date, content, createdAt, updatedAt, type, status, originId)
      SELECT id, month, content, created_at, updated_at, 'goal', status, NULL
      FROM goals
    `.execute(db);

    await db.schema.dropTable("notes").execute();
    await db.schema.dropTable("tasks").execute();
    await db.schema.dropTable("intentions").execute();
    await db.schema.dropTable("goals").execute();
  },

  async down(db: Kysely<any>) {
    // Recreate notes table
    await db.schema
      .createTable("notes")
      .addColumn("id", "text", (cb) => cb.primaryKey())
      .addColumn("content", "text", (cb) => cb.notNull())
      .addColumn("created_at", "text", (cb) => cb.notNull())
      .addColumn("updated_at", "text", (cb) => cb.notNull())
      .addColumn("date", "text", (cb) => cb.notNull())
      .execute();

    // Recreate tasks table
    await db.schema
      .createTable("tasks")
      .addColumn("id", "text", (cb) => cb.primaryKey())
      .addColumn("content", "text", (cb) => cb.notNull())
      .addColumn("created_at", "text", (cb) => cb.notNull())
      .addColumn("updated_at", "text", (cb) => cb.notNull())
      .addColumn("date", "text", (cb) => cb.notNull())
      .addColumn("status", "text", (cb) => cb.notNull())
      .addColumn("original_id", "text")
      .execute();

    // Recreate intentions table
    await db.schema
      .createTable("intentions")
      .addColumn("id", "text", (cb) => cb.primaryKey())
      .addColumn("month", "text", (cb) => cb.unique().notNull())
      .addColumn("content", "text", (cb) => cb.notNull())
      .addColumn("created_at", "text", (cb) => cb.notNull())
      .addColumn("updated_at", "text", (cb) => cb.notNull())
      .execute();

    // Recreate goals table
    await db.schema
      .createTable("goals")
      .addColumn("id", "text", (cb) => cb.primaryKey())
      .addColumn("month", "text", (cb) => cb.notNull())
      .addColumn("content", "text", (cb) => cb.notNull())
      .addColumn("status", "text", (cb) => cb.notNull())
      .addColumn("created_at", "text", (cb) => cb.notNull())
      .addColumn("updated_at", "text", (cb) => cb.notNull())
      .execute();

    // Migrate data back
    await sql`
      INSERT INTO notes (id, date, content, created_at, updated_at)
      SELECT id, date, content, createdAt, updatedAt
      FROM entries WHERE type = 'note'
    `.execute(db);

    await sql`
      INSERT INTO tasks (id, date, content, created_at, updated_at, status, original_id)
      SELECT id, date, content, createdAt, updatedAt, status, originId
      FROM entries WHERE type = 'task'
    `.execute(db);

    await sql`
      INSERT INTO intentions (id, month, content, created_at, updated_at)
      SELECT id, date, content, createdAt, updatedAt
      FROM entries WHERE type = 'intention'
    `.execute(db);

    await sql`
      INSERT INTO goals (id, month, content, created_at, updated_at, status)
      SELECT id, date, content, createdAt, updatedAt, status
      FROM entries WHERE type = 'goal'
    `.execute(db);

    await db.schema.dropTable("entries").execute();
  },
};

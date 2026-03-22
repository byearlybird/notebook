import { type Kysely, type Migration } from "kysely";

export const Migration20260319IntentionsGoals: Migration = {
  async up(db: Kysely<any>) {
    await db.schema
      .createTable("intentions")
      .addColumn("id", "text", (cb) => cb.primaryKey())
      .addColumn("month", "text", (cb) => cb.unique().notNull())
      .addColumn("content", "text", (cb) => cb.notNull())
      .addColumn("created_at", "text", (cb) => cb.notNull())
      .addColumn("updated_at", "text", (cb) => cb.notNull())
      .execute();

    await db.schema
      .createTable("goals")
      .addColumn("id", "text", (cb) => cb.primaryKey())
      .addColumn("month", "text", (cb) => cb.notNull())
      .addColumn("content", "text", (cb) => cb.notNull())
      .addColumn("status", "text", (cb) => cb.notNull())
      .addColumn("created_at", "text", (cb) => cb.notNull())
      .addColumn("updated_at", "text", (cb) => cb.notNull())
      .execute();
  },
  async down(db: Kysely<any>) {
    await db.schema.dropTable("goals").execute();
    await db.schema.dropTable("intentions").execute();
  },
};

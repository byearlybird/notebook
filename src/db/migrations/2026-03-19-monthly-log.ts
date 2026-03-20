import { type Kysely, type Migration } from "kysely";

export const Migration20260319MonthlyLog: Migration = {
  async up(db: Kysely<any>) {
    await db.schema
      .createTable("monthly_logs")
      .addColumn("id", "text", (cb) => cb.primaryKey())
      .addColumn("month", "text", (cb) => cb.unique().notNull())
      .addColumn("intention", "text")
      .addColumn("created_at", "text", (cb) => cb.notNull())
      .addColumn("updated_at", "text", (cb) => cb.notNull())
      .execute();

    await db.schema
      .createTable("monthly_goals")
      .addColumn("id", "text", (cb) => cb.primaryKey())
      .addColumn("monthly_log_id", "text", (cb) => cb.notNull())
      .addColumn("content", "text", (cb) => cb.notNull())
      .addColumn("status", "text", (cb) => cb.notNull())
      .addColumn("created_at", "text", (cb) => cb.notNull())
      .addColumn("updated_at", "text", (cb) => cb.notNull())
      .execute();
  },
  async down(db: Kysely<any>) {
    await db.schema.dropTable("monthly_goals").execute();
    await db.schema.dropTable("monthly_logs").execute();
  },
};

import { type Kysely, type Migration } from "kysely";

export const Migration20260318RemoveIsDeleted: Migration = {
  async up(db: Kysely<any>) {
    // Delete any soft-deleted rows before dropping the column
    await db.deleteFrom("notes").where("is_deleted", "=", 1).execute();
    await db.deleteFrom("tasks").where("is_deleted", "=", 1).execute();

    await db.schema.alterTable("notes").dropColumn("is_deleted").execute();
    await db.schema.alterTable("tasks").dropColumn("is_deleted").execute();
  },
  async down(db: Kysely<any>) {
    await db.schema
      .alterTable("notes")
      .addColumn("is_deleted", "integer", (cb) => cb.notNull().defaultTo(0))
      .execute();
    await db.schema
      .alterTable("tasks")
      .addColumn("is_deleted", "integer", (cb) => cb.notNull().defaultTo(0))
      .execute();
  },
};

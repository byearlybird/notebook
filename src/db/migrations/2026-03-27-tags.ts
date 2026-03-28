import type { Kysely, Migration } from "kysely";

export const Migration20260327Tags: Migration = {
  async up(db: Kysely<any>) {
    await db.schema
      .createTable("tags")
      .addColumn("id", "text", (col) => col.primaryKey())
      .addColumn("name", "text", (col) => col.notNull())
      .execute();

    await db.schema
      .createTable("entryTags")
      .addColumn("id", "text", (col) => col.primaryKey())
      .addColumn("entryId", "text", (col) => col.notNull())
      .addColumn("tagId", "text", (col) => col.notNull())
      .execute();
  },
  async down(db: Kysely<any>) {
    await db.schema.dropTable("entryTags").execute();
    await db.schema.dropTable("tags").execute();
  },
};

import { sql, type Kysely, type Migration } from "kysely";

export const Migration20260401EntryTag: Migration = {
  async up(db: Kysely<any>) {
    await db.schema.alterTable("entries").addColumn("tagId", "text").execute();
    await sql`UPDATE entries SET tagId = (SELECT tagId FROM entryTags WHERE entryId = id LIMIT 1)`.execute(
      db,
    );
    await db.schema.dropTable("entryTags").execute();
  },
  async down(db: Kysely<any>) {
    await db.schema.alterTable("entries").dropColumn("tagId").execute();
  },
};

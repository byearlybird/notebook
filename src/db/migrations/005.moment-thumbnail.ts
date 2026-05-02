import { sql } from "kysely";
import type { Kysely, Migration } from "kysely";

export const M005_moment_thumbnail: Migration = {
  // oxlint-disable-next-line typescript/no-explicit-any
  async up(db: Kysely<any>) {
    await sql`ALTER TABLE moments ADD COLUMN thumbnail BLOB`.execute(db);
  },
};

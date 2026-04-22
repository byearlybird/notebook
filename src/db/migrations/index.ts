import type { Migration } from "kysely";
import { M001_init } from "./001.init";
import { M002_schema } from "./002.schema";

export const migrations: Record<string, Migration> = {
  "2023-08-01": M001_init,
  "2026-04-22": M002_schema,
};

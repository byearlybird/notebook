import type { Migration } from "kysely";
import { Migration20260201Init } from "./2026-02-01-init";
import { Migration20260316TaskRollover } from "./2026-03-16-task-rollover";
import { Migration20260318LexicalContent } from "./2026-03-18-lexical-content";
import { Migration20260318RemoveIsDeleted } from "./2026-03-18-remove-is-deleted";
import { Migration20260319RemoveScopeCategory } from "./2026-03-19-remove-scope-category";
import { Migration20260319MonthlyLog } from "./2026-03-19-monthly-log";

export const migrations: Record<string, Migration> = {
  "2026-02-01": Migration20260201Init,
  "2026-03-16": Migration20260316TaskRollover,
  "2026-03-18a": Migration20260318LexicalContent,
  "2026-03-18b": Migration20260318RemoveIsDeleted,
  "2026-03-19": Migration20260319RemoveScopeCategory,
  "2026-03-19b": Migration20260319MonthlyLog,
};

import type { Migration } from "kysely";
import { Migration001Init } from "./001-init";
import { Migration002DropGoals } from "./002-drop-goals";
import { Migration20260327Tags } from "./2026-03-27-tags";
import { Migration20260401EntryTag } from "./2026-04-01-entry-single-tag";
import { Migration20260401EntrySearchMeta } from "./2026-04-01-entry-search-meta";
import { Migration20260401RenameTagsToLabels } from "./2026-04-01-rename-tags-to-labels";

export const migrations: Record<string, Migration> = {
  "001": Migration001Init,
  "002": Migration002DropGoals,
  "003": Migration20260327Tags,
  "004": Migration20260401EntryTag,
  "005": Migration20260401RenameTagsToLabels,
  "006": Migration20260401EntrySearchMeta,
};

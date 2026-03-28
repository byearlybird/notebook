import type { Database } from "@/db/schema";
import type { Label } from "@/models";
import type { Kysely } from "kysely";

export async function fetchLabelMap(
  db: Kysely<Database>,
  labelIds: (string | null)[],
): Promise<Map<string, Label>> {
  const ids = labelIds.filter(Boolean) as string[];
  if (!ids.length) return new Map();
  const labels = await db.selectFrom("labels").selectAll().where("id", "in", ids).execute();
  return new Map(labels.map((l) => [l.id, l]));
}

import { useDBQuery } from "./use-db-query";

type LabelRow = { id: string; name: string };

export function useLabels(): LabelRow[] {
  const results = useDBQuery((db) =>
    db
      .selectFrom("labels")
      .select(["id", "name"])
      .where("is_deleted", "=", 0)
      .orderBy("name", "asc"),
  );

  return results || [];
}

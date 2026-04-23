import { useDBQuery } from "./use-db-query";
import type { EntryFilters } from "./use-entries";

export function useEntriesOnDate(date: string, filters?: EntryFilters) {
  const results = useDBQuery((db) => {
    let query = db
      .selectFrom("timeline")
      .where("created_at", "like", `${date}%`)
      .orderBy("created_at", "desc")
      .selectAll();
    if (filters?.searchTerm) query = query.where("content", "like", `%${filters.searchTerm}%`);
    if (filters?.labelName) query = query.where("label_name", "=", filters.labelName);
    return query;
  });

  return results ?? [];
}

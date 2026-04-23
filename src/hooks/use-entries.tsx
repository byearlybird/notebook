import { useDBQuery } from "./use-db-query";

export type EntryFilters = { searchTerm?: string; labelName?: string };

export function useEntries(filters?: EntryFilters) {
  return useDBQuery((db) => {
    let query = db.selectFrom("timeline").orderBy("created_at", "desc").selectAll();
    if (filters?.searchTerm) query = query.where("content", "like", `%${filters.searchTerm}%`);
    if (filters?.labelName) query = query.where("label_name", "=", filters.labelName);
    return query;
  });
}

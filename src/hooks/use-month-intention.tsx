import type { DBSchema } from "@/db/schema";
import { useDBQuery } from "./use-db-query";
import { useTodayDate } from "./use-today-date";

type Intention = DBSchema["intentions"];

export function useMonthIntention(): Intention | undefined {
  const today = useTodayDate();
  const month = today.slice(0, 7);

  const results = useDBQuery((db) =>
    db
      .selectFrom("intentions")
      .selectAll()
      .where("month", "=", month)
      .where("is_deleted", "=", 0)
      .limit(1),
  ) as Intention[] | undefined;

  return results?.[0];
}

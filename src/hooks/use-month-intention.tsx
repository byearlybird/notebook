import type { DBSchema } from "@/db/schema";
import { useDBQuery } from "./use-db-query";

type Intention = DBSchema["intentions"];

export function useMonthIntention(month: string): Intention | undefined {
  const results = useDBQuery((db) =>
    db.selectFrom("intentions").selectAll().where("month", "=", month).limit(1),
  ) as Intention[] | undefined;

  return results?.[0];
}

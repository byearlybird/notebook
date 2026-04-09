import { intentionService } from "@/app";
import { notFound } from "@tanstack/react-router";
import type { Intention } from "@/models";
import { queryOptions } from "@tanstack/react-query";

export const intentionQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["entries", "intentions", id],
    queryFn: async (): Promise<Intention> => {
      const intention = await intentionService.get(id);
      if (!intention) throw notFound();
      return intention;
    },
  });

export const intentionByMonthQueryOptions = (month: string) =>
  queryOptions({
    queryKey: ["entries", "intentions", "byMonth", month],
    queryFn: () => intentionService.getByMonth(month),
  });

import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@nanostores/react";
import { Page } from "@/components/page-layout";
import { MonthGroup } from "@/components/month-group";
import { useEntries } from "@/hooks/use-entries";
import { openEntryDetail } from "@/stores/entry-detail";
import { $debouncedSearchTerm, $labelFilter } from "@/stores/entry-search";
import type { DBSchema } from "@/db/schema";
import { NoteIcon } from "@phosphor-icons/react";

type TimelineView = DBSchema["timeline"];

export const Route = createFileRoute("/timeline")({
  component: TimelinePage,
});

function TimelinePage() {
  const searchTerm = useStore($debouncedSearchTerm);
  const labelFilter = useStore($labelFilter);
  const entries = useEntries({
    searchTerm: searchTerm || undefined,
    labelName: labelFilter?.name,
  });
  const groupedEntries = useMemo(() => {
    const months: Record<string, Record<string, TimelineView[]>> = {};
    for (const entry of entries ?? []) {
      const month = entry.created_at.slice(0, 7);
      const date = entry.created_at.slice(0, 10);
      const days = (months[month] ??= {});
      (days[date] ??= []).push(entry);
    }
    return Object.entries(months)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, days]) => ({
        month,
        days: Object.entries(days)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([date, entries]) => ({ date, entries })),
      }));
  }, [entries]);

  return (
    <Page>
      {groupedEntries.map((group) => (
        <MonthGroup
          key={group.month}
          month={group.month}
          days={group.days}
          onSelect={(entry) => openEntryDetail(entry.id)}
        />
      ))}
      {groupedEntries.length === 0 && (
        <div className="text-foreground-muted/70 flex justify-center items-center flex-col space-y-2 size-full">
          <NoteIcon weight="light" className="size-8" />
          <h2>No entries yet</h2>
        </div>
      )}
    </Page>
  );
}

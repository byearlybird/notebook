import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@nanostores/react";
import { Page } from "@/components/page-layout";
import { EntryGroup } from "@/components/entry-group";
import { useEntries } from "@/hooks/use-entries";
import { openEntryDetail } from "@/stores/entry-detail";
import { $debouncedSearchTerm, $labelFilter } from "@/stores/entry-search";
import type { DBSchema } from "@/db/schema";

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
    const groups: Record<string, TimelineView[]> = {};
    for (const entry of entries ?? []) {
      const date = entry.created_at.slice(0, 10);
      (groups[date] ??= []).push(entry);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, entries]) => ({ date, entries }));
  }, [entries]);

  return (
    <Page>
      {groupedEntries.map((group) => (
        <EntryGroup
          key={group.date}
          date={group.date}
          entries={group.entries}
          onSelect={(entry) => openEntryDetail(entry.id)}
        />
      ))}
    </Page>
  );
}

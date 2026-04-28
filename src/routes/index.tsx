import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@nanostores/react";
import { Page, PageHeader, PageTitle } from "@/components/page-layout";
import { Entry } from "@/components/entry";
import { useTodayDate } from "@/hooks/use-today-date";
import { useEntriesOnDate } from "@/hooks/use-entries-on-date";
import { openEntryDetail } from "@/stores/entry-detail";
import { formatDate, formatWeekday, formatWeekdayShort } from "@/utils/dates";
import { $debouncedSearchTerm, $labelFilter } from "@/stores/entry-search";
import { NoteIcon } from "@phosphor-icons/react";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const date = useTodayDate();
  const searchTerm = useStore($debouncedSearchTerm);
  const labelFilter = useStore($labelFilter);
  const entries = useEntriesOnDate(date, {
    searchTerm: searchTerm || undefined,
    labelName: labelFilter?.name,
  });

  return (
    <Page>
      <PageHeader>
        <PageTitle>
          {formatDate(date)}{" "}
          <span className="ms-2 font-normal text-foreground-muted text-sm">
            <span className="sm:hidden">{formatWeekdayShort(date)}</span>
            <span className="hidden sm:inline">{formatWeekday(date)}</span>
          </span>
        </PageTitle>
      </PageHeader>
      {entries.map((entry) => (
        <Entry key={entry.id} {...entry} onClick={() => openEntryDetail(entry.id)} />
      ))}
      {entries.length === 0 && (
        <div className="text-foreground-muted/70 flex justify-center items-center flex-col space-y-2 flex-1 w-full">
          <NoteIcon weight="light" className="size-8" />
          <h2>No entries yet today</h2>
        </div>
      )}
    </Page>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@nanostores/react";
import { Page, PageHeader, PageTitle } from "@/components/page-layout";
import { Entry } from "@/components/entry";
import { useTodayDate } from "@/hooks/use-today-date";
import { useEntriesOnDate } from "@/hooks/use-entries-on-date";
import { useMonthIntention } from "@/hooks/use-month-intention";
import { useSetIntention } from "@/hooks/use-set-intention";
import { openEntryDetail } from "@/stores/entry-detail";
import { formatDate } from "@/utils/dates";
import { $debouncedSearchTerm, $labelFilter } from "@/stores/entry-search";

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
  const intention = useMonthIntention();
  const handleSetIntention = useSetIntention();

  return (
    <Page>
      <PageHeader>
        <PageTitle>{formatDate(date)}</PageTitle>
      </PageHeader>
      {entries.map((entry) => (
        <Entry key={entry.id} {...entry} onClick={() => openEntryDetail(entry.id)} />
      ))}
      {entries.length === 0 && (
        <div className="flex items-center justify-center h-48">
          {intention ? (
            <p className="text-2xl font-serif text-neutral-700 text-center px-4">
              {intention.content}
            </p>
          ) : (
            <button
              onClick={handleSetIntention}
              className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              Set an intention for this month +
            </button>
          )}
        </div>
      )}
    </Page>
  );
}

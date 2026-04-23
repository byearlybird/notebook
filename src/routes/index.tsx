import { createFileRoute } from "@tanstack/react-router";
import { Page, PageHeader, PageTitle } from "@/components/page-layout";
import { Entry } from "@/components/entry";
import { useTodayDate } from "@/hooks/use-today-date";
import { useEntriesOnDate } from "@/hooks/use-entries-on-date";
import { openEntryDetail } from "@/stores/entry-detail";
import { formatDate } from "@/utils/dates";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const date = useTodayDate();
  const entries = useEntriesOnDate(date);

  return (
    <Page>
      <PageHeader>
        <PageTitle>{formatDate(date)}</PageTitle>
      </PageHeader>
      {entries.map((entry) => (
        <Entry key={entry.id} {...entry} onClick={() => openEntryDetail(entry.id)} />
      ))}
    </Page>
  );
}

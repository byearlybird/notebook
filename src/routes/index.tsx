import { createFileRoute } from "@tanstack/react-router";
import { Page, PageHeader, PageTitle } from "@/components/page-layout";
import { Entry } from "@/components/entry";
import { useTodayDate } from "@/hooks/use-today-date";
import { useEntriesOnDate } from "@/hooks/use-entries-on-date";
import { useEntryDetail } from "@/contexts/entry-detail-context";
import { formatDate } from "@/utils/dates";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const { openDetail } = useEntryDetail();
  const date = useTodayDate();
  const entries = useEntriesOnDate(date);

  return (
    <Page>
      <PageHeader>
        <PageTitle>{formatDate(date)}</PageTitle>
      </PageHeader>
      {entries.map((entry) => (
        <Entry key={entry.id} {...entry} onClick={() => openDetail(entry.id)} />
      ))}
    </Page>
  );
}

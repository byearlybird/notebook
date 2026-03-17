import { getEntriesToday } from "@/services/entries-service";
import { Timeline } from "@/features/entries/timeline";
import type { TimelineItem } from "@/features/entries/types";
import { formatDayOfWeek, formatMonthDate } from "@/utils/date-utils";
import { SlidersHorizontalIcon } from "@phosphor-icons/react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app/")({
  component: JournalPage,
  loader: async () => {
    const entries = await getEntriesToday();
    return { entries };
  },
});

function JournalPage() {
  const navigate = useNavigate();
  const { entries } = Route.useLoaderData();
  const empty = entries.length === 0;

  const handleEntryClick = (entry: TimelineItem) => {
    if (entry.type === "note") {
      navigate({
        to: "/note/$id",
        params: { id: entry.id },
        search: { from: "index" },
        viewTransition: { types: ["slide-left"] },
      });
    } else if (entry.type === "task") {
      navigate({
        to: "/task/$id",
        params: { id: entry.id },
        search: { from: "index" },
        viewTransition: { types: ["slide-left"] },
      });
    }
  };

  return (
    <div className="px-4 py-2 space-y-4">
      <header className="sticky top-0 backdrop-blur-md bg-slate-medium py-1 flex justify-between items-center">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold">{formatMonthDate(new Date())}</span>
          <span className="font-bold text-sm text-cloud-light">{formatDayOfWeek(new Date())}</span>
        </div>
        <Link to="/settings" viewTransition={{ types: ["slide-left"] }}>
          <SlidersHorizontalIcon className="size-6 text-cloud-light" />
        </Link>
      </header>
      {empty ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-cloud-light text-center pt-10">No entries yet today</p>
        </div>
      ) : (
        <Timeline entries={entries} onEntryClick={handleEntryClick} />
      )}
    </div>
  );
}

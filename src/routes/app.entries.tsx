import { getEntriesGroupedByDate } from "@/services/entries-service";
import { DayEntriesItem } from "@/features/entries";
import type { TimelineItem } from "@/features/entries/types";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app/entries")({
  component: RouteComponent,
  loader: async () => {
    const entriesByDate = await getEntriesGroupedByDate();
    return { entriesByDate };
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { entriesByDate } = Route.useLoaderData();

  const handleEntryClick = (entry: TimelineItem) => {
    if (entry.type === "note") {
      navigate({
        to: "/note/$id",
        params: { id: entry.id },
        search: { from: "entries" },
        viewTransition: { types: ["slide-left"] },
      });
    } else if (entry.type === "task") {
      navigate({
        to: "/task/$id",
        params: { id: entry.id },
        search: { from: "entries" },
        viewTransition: { types: ["slide-left"] },
      });
    }
  };

  return (
    <div className="flex flex-col px-4 pt-2 divide-y divide-dashed *:not-first:pt-8">
      {Object.entries(entriesByDate).length === 0 && (
        <div className="flex flex-col items-center justify-center h-full pt-24">
          <p className="text-sm text-cloud-light">No entries yet</p>
        </div>
      )}
      {Object.entries(entriesByDate).map(([date, entries]) => (
        <DayEntriesItem key={date} date={date} entries={entries} onEntryClick={handleEntryClick} />
      ))}
    </div>
  );
}

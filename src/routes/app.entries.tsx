import { entryService } from "@/app";
import { DayEntriesItem } from "@/features/entries";
import type { TimelineItem } from "@/features/entries/types";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app/entries")({
  component: RouteComponent,
  loader: async () => {
    return await entryService.getGroupedByDate();
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const entriesByDate = Route.useLoaderData();

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
    } else if (entry.type === "goal") {
      navigate({
        to: "/goal/$id",
        params: { id: entry.id },
        search: { from: "entries" },
        viewTransition: { types: ["slide-left"] },
      });
    }
  };

  const dates = Object.keys(entriesByDate);

  return (
    <div className="flex flex-col px-4 pt-2 min-h-full divide-y divide-dashed *:not-first:pt-8">
      {dates.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center -mt-20">
          <p className="text-xs text-cloud-light">No entries yet</p>
        </div>
      )}
      {dates.map((date) => (
        <DayEntriesItem
          key={date}
          date={date}
          entries={entriesByDate[date]}
          onEntryClick={handleEntryClick}
        />
      ))}
    </div>
  );
}

import { entryService, intentionService } from "@/app";
import { Renderer } from "@/components/lexical/renderer";
import { Timeline } from "@/components/entries/timeline";
import type { Entry } from "@/models";
import { formatDayOfWeek, formatMonthDate, getCurrentMonth } from "@/utils/date-utils";
import { FlowerLotusIcon, SlidersHorizontalIcon } from "@phosphor-icons/react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app/")({
  component: JournalPage,
  loader: async () => {
    const [entries, intention] = await Promise.all([
      entryService.getToday(),
      intentionService.getByMonth(getCurrentMonth()),
    ]);
    return { entries, intention: intention?.content ?? null };
  },
});

function JournalPage() {
  const navigate = useNavigate();
  const { entries, intention } = Route.useLoaderData();
  const empty = entries.length === 0;

  const handleEntryClick = (entry: Entry) => {
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
    } else if (entry.type === "goal") {
      navigate({
        to: "/goal/$id",
        params: { id: entry.id },
        search: { from: "index" },
        viewTransition: { types: ["slide-left"] },
      });
    } else if (entry.type === "intention") {
      navigate({
        to: "/intention/$id",
        params: { id: entry.id },
        search: { from: "index" },
        viewTransition: { types: ["slide-left"] },
      });
    }
  };

  return (
    <div className="px-4 py-2 space-y-4 flex flex-col min-h-full">
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
        <div className="flex-1 flex flex-col items-center justify-center gap-3 -mt-20">
          {intention && (
            <div className="flex items-center gap-2 text-cloud-light">
              <FlowerLotusIcon className="size-4 shrink-0 mt-0.5" />
              <div className="line-clamp-3">
                <Renderer content={intention} />
              </div>
            </div>
          )}
          <p className="text-cloud-light text-xs">No entries yet today</p>
        </div>
      ) : (
        <Timeline entries={entries} onEntryClick={handleEntryClick} />
      )}
    </div>
  );
}

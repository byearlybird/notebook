import { entryService, intentionService, labelService } from "@/app";
import { Renderer } from "@/components/lexical/renderer";
import { IntentionDialog } from "@/components/entries/intention-dialog";
import { LabelFilter } from "@/components/entries/label-filter";
import { DayEntriesItem } from "@/components/entries";
import { Timeline } from "@/components/entries/timeline";
import type { Entry } from "@/models";
import { LabelFilterContext } from "@/contexts/label-filter-context";
import { formatDayOfWeek, formatMonthDate, getCurrentMonth } from "@/utils/date-utils";
import { PlusIcon, StarIcon } from "@phosphor-icons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import z from "zod";

const searchSchema = z.object({
  view: z.enum(["entries"]).optional().catch(undefined),
});

export const Route = createFileRoute("/app/")({
  component: JournalPage,
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
  loader: async () => {
    const [entries, intention, entriesByDate, allLabels] = await Promise.all([
      entryService.getToday(),
      intentionService.getByMonth(getCurrentMonth()),
      entryService.getGroupedByDate(),
      labelService.getAll(),
    ]);
    return { entries, intention: intention?.content ?? null, entriesByDate, allLabels };
  },
});

function JournalPage() {
  const navigate = useNavigate();
  const { entries, intention, entriesByDate, allLabels } = Route.useLoaderData();
  const { view } = Route.useSearch();
  const [filterLabelId, setFilterLabelId] = useContext(LabelFilterContext);
  const [dialogOpen, setDialogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filterEntries = (items: Entry[]) =>
    filterLabelId === null
      ? items
      : items.filter((e) => "label" in e && e.label?.id === filterLabelId);

  const filteredEntries = useMemo(() => filterEntries(entries), [entries, filterLabelId]);
  const filteredEntriesByDate = useMemo(() => {
    if (filterLabelId === null) return entriesByDate;
    const result: Record<string, Entry[]> = {};
    for (const [date, items] of Object.entries(entriesByDate)) {
      const filtered = filterEntries(items);
      if (filtered.length > 0) result[date] = filtered;
    }
    return result;
  }, [entriesByDate, filterLabelId]);

  const empty = filteredEntries.length === 0;
  const filtering = filterLabelId !== null;

  useEffect(() => {
    if (view === "entries" && scrollRef.current) {
      scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: "instant" });
    }
  }, [view]);

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
    } else if (entry.type === "intention") {
      navigate({
        to: "/intention/$id",
        params: { id: entry.id },
        search: { from: "index" },
        viewTransition: { types: ["slide-left"] },
      });
    }
  };

  const handleAllEntriesClick = (entry: Entry) => {
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
    } else if (entry.type === "intention") {
      navigate({
        to: "/intention/$id",
        params: { id: entry.id },
        search: { from: "entries" },
        viewTransition: { types: ["slide-left"] },
      });
    }
  };

  const dates = Object.keys(filteredEntriesByDate);

  return (
    <>
      <div ref={scrollRef} className="flex h-full overflow-x-auto snap-x snap-mandatory">
        {/* Today panel */}
        <div className="w-full h-full shrink-0 snap-start overflow-y-auto pb-20 px-4 py-2 space-y-4 flex flex-col">
          <header className="sticky top-0 backdrop-blur-md bg-slate-medium py-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold">{formatMonthDate(new Date())}</span>
              <span className="font-bold text-sm text-cloud-light">{formatDayOfWeek(new Date())}</span>
              {allLabels.length > 0 && (
                <div className="ml-auto">
                  <LabelFilter allLabels={allLabels} selectedLabelId={filterLabelId} onChange={setFilterLabelId} />
                </div>
              )}
            </div>
          </header>
          {empty ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 -mt-20">
              {!filtering && intention ? (
                <div className="flex items-center gap-2 text-cloud-light">
                  <StarIcon className="size-4 shrink-0 mt-0.5" />
                  <div className="line-clamp-3">
                    <Renderer content={intention} />
                  </div>
                </div>
              ) : !filtering ? (
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-cloud-light text-sm"
                  onClick={() => setDialogOpen(true)}
                >
                  <StarIcon className="size-4" />
                  Set a monthly intention
                  <PlusIcon className="size-3.5" />
                </button>
              ) : null}
              <p className="text-cloud-light text-xs">
                {filtering ? "No matching entries" : "No entries yet today"}
              </p>
            </div>
          ) : (
            <Timeline entries={filteredEntries} onEntryClick={handleEntryClick} />
          )}
        </div>
        {/* All Entries panel */}
        <div className="w-full h-full shrink-0 snap-start overflow-y-auto pb-20 px-4 pt-2">
          <div className="flex flex-col min-h-full divide-y divide-dashed *:not-first:pt-8">
            {dates.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center -mt-20">
                <p className="text-xs text-cloud-light">No entries yet</p>
              </div>
            )}
            {dates.map((date) => (
              <DayEntriesItem
                key={date}
                date={date}
                entries={filteredEntriesByDate[date]}
                onEntryClick={handleAllEntriesClick}
              />
            ))}
          </div>
        </div>
      </div>

      <IntentionDialog
        month={getCurrentMonth()}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}

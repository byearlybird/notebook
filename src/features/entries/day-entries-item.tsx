import type { TimelineItem } from "./types";
import { formatMonthDate, formatDayOfWeek } from "@/utils/date-utils";
import { Timeline } from "./timeline";
import { parseISO } from "date-fns";

export function DayEntriesItem({
  entries,
  date,
  onEntryClick,
}: {
  entries: TimelineItem[];
  date: string;
  onEntryClick?: (entry: TimelineItem) => void;
}) {
  return (
    <article className="flex flex-col gap-4">
      <span className="flex items-baseline gap-3">
        <time className="font-medium text-lg">{formatMonthDate(parseISO(date))}</time>
        <span className="text-sm text-cloud-light">{formatDayOfWeek(parseISO(date))}</span>
      </span>
      <Timeline size="compact" entries={entries} onEntryClick={onEntryClick} />
    </article>
  );
}

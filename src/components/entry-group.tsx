import type { DBSchema } from "@/db/schema";
import { formatDayWeekday } from "@/utils/dates";
import { Entry } from "./entry";

type TimelineView = DBSchema["timeline"];

type EntryGroupProps = {
  date: string;
  entries: TimelineView[];
  onSelect?: (entry: TimelineView) => void;
};

export function EntryGroup({ date, entries, onSelect }: EntryGroupProps) {
  const { day, weekday } = formatDayWeekday(date);
  return (
    <div className="not-first:before:content-[''] not-first:before:block not-first:before:w-1/6 not-first:before:mx-auto not-first:before:border-t not-first:before:border-border/50 not-first:before:my-4">
      <h2 className="sticky top-11 z-5 bg-surface text-base px-2 py-1 mb-1 text-foreground">
        {day} <span className="text-foreground-muted ms-1">{weekday}</span>
      </h2>
      {entries.map((entry) => (
        <Entry compact key={entry.id} {...entry} onClick={() => onSelect?.(entry)} />
      ))}
    </div>
  );
}

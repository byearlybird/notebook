import type { DBSchema } from "@/db/schema";
import { formatMonthYear } from "@/utils/dates";
import { MonthIntentionLabel } from "./month-intention-label";
import { EntryGroup } from "./entry-group";

type TimelineView = DBSchema["timeline"];

type DayGroup = { date: string; entries: TimelineView[] };

type MonthGroupProps = {
  month: string;
  days: DayGroup[];
  onSelect?: (entry: TimelineView) => void;
};

export function MonthGroup({ month, days, onSelect }: MonthGroupProps) {
  const { month: monthLabel, year } = formatMonthYear(`${month}-01`);

  return (
    <div className="not-first:border-t border-dashed not-first:border-border/50 not-first:mt-4 not-first:pt-4">
      <div className="sticky top-0 z-10 bg-surface p-2 flex items-baseline justify-between gap-6">
        <h2 className="text-xl font-semibold text-foreground shrink-0">
          {monthLabel}{" "}
          <span className="font-normal text-foreground-muted text-sm">{year}</span>
        </h2>
        <MonthIntentionLabel month={month} />
      </div>
      <div>
        {days.map((day) => (
          <EntryGroup key={day.date} date={day.date} entries={day.entries} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

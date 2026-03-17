import { formatTime } from "@/utils/date-utils";
import {
  CheckSquareIcon,
  CircleIcon,
  SquareIcon,
  XSquareIcon,
  ArrowSquareRightIcon,
} from "@phosphor-icons/react";
import type { TimelineItem } from "./types";
import { Button as BaseButton } from "@base-ui/react";
import { cx } from "cva";

export function Timeline({
  entries,
  size = "default",
  onEntryClick,
}: {
  entries: TimelineItem[];
  size?: "default" | "compact";
  onEntryClick?: (entry: TimelineItem) => void;
}) {
  const handleClick = (entry: TimelineItem) => {
    onEntryClick?.(entry);
  };

  return (
    <div className="flex flex-col w-full">
      {entries.map((entry, index) => (
        <div key={entry.id} className="flex gap-3">
          {/* Left side: dot and line */}
          <div className="flex flex-col items-center">
            {entry.type === "note" ? (
              <CircleIcon className="size-4 text-cloud-light" />
            ) : (
              <TaskIcon status={entry.status} />
            )}
            {index < entries.length - 1 && (
              <div className="w-px flex-1 border-r border-slate-light border-dotted my-1" />
            )}
          </div>

          {/* Right side: time and content */}
          <BaseButton
            nativeButton={false}
            render={<div />}
            onClick={() => handleClick(entry)}
            className={size === "compact" ? "flex-1 pb-4 min-h-16" : "flex-1 pb-4 min-h-20"}
          >
            <div
              className={
                size === "compact" ? "text-xs text-cloud-medium" : "text-sm text-cloud-medium"
              }
            >
              {formatTime(entry.created_at)}
            </div>
            <div
              className={cx(
                "mt-2 whitespace-pre-line",
                size === "compact" && "text-sm line-clamp-3",
              )}
            >
              {entry.content}
            </div>
          </BaseButton>
        </div>
      ))}
    </div>
  );
}

function TaskIcon(props: { status: "complete" | "incomplete" | "canceled" | "deferred" }) {
  switch (props.status) {
    case "complete":
      return <CheckSquareIcon className="text-gold-light" />;
    case "canceled":
      return <XSquareIcon className="text-cloud-dark" />;
    case "deferred":
      return <ArrowSquareRightIcon className="text-cloud-light" />;
    default:
      return <SquareIcon className="text-cloud-light" />;
  }
}

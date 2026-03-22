import { formatTime } from "@/utils/date-utils";
import {
  CheckSquareIcon,
  CircleIcon,
  FlowerLotusIcon,
  SquareIcon,
  StarIcon,
  XSquareIcon,
  ArrowSquareRightIcon,
} from "@phosphor-icons/react";
import type { Entry } from "@/models";
import { Button as BaseButton } from "@base-ui/react";
import { cx } from "cva";
import { Renderer } from "@/components/lexical";

export function Timeline({
  entries,
  size = "default",
  onEntryClick,
}: {
  entries: Entry[];
  size?: "default" | "compact";
  onEntryClick?: (entry: Entry) => void;
}) {
  const handleClick = (entry: Entry) => {
    onEntryClick?.(entry);
  };

  return (
    <div className="flex flex-col w-full">
      {entries.map((entry, index) => (
        <div key={entry.id} className="flex gap-3">
          {/* Left side: dot and line */}
          <div className="flex flex-col items-center">
            <EntryIcon entry={entry} />
            {index < entries.length - 1 && (
              <div className="w-px flex-1 border-r border-slate-light border-dotted my-1" />
            )}
          </div>

          {/* Right side: time and content */}
          <BaseButton
            nativeButton={false}
            render={<div />}
            onClick={() => handleClick(entry)}
            className={cx("flex-1 min-w-0 pb-4", size === "compact" ? "min-h-16" : "min-h-20")}
          >
            <div className={cx("text-cloud-medium", size === "compact" ? "text-xs" : "text-sm")}>
              {formatTime(entry.createdAt)}
            </div>
            <div className={cx("mt-2", size === "compact" && "text-sm line-clamp-3")}>
              <Renderer content={entry.content} />
            </div>
          </BaseButton>
        </div>
      ))}
    </div>
  );
}

function EntryIcon({ entry }: { entry: Entry }) {
  switch (entry.type) {
    case "note":
      return <CircleIcon className="size-4 text-cloud-light" />;
    case "task":
      return <TaskIcon status={entry.status} />;
    case "intention":
      return <FlowerLotusIcon className="size-4 text-cloud-light" />;
    case "goal":
      return (
        <StarIcon
          weight={entry.status === "complete" ? "fill" : "regular"}
          className={cx(
            "size-4",
            entry.status === "complete" ? "text-gold-light" : "text-cloud-light",
          )}
        />
      );
  }
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

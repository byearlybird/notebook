import {
  SquareIcon,
  CircleIcon,
  CheckSquareIcon,
  XSquareIcon,
  ArrowSquareRightIcon,
  DiamondIcon,
  ImageIcon,
  TagSimpleIcon,
  PushPinSimpleIcon,
  TriangleIcon,
} from "@phosphor-icons/react";
import type { DBSchema, TaskTable } from "@/db/schema";
import { formatTime } from "@/utils/dates";
import { moodColor } from "@/utils/mood-color";
import { moodLabel } from "@/utils/mood-label";
import { taskService } from "@/services/task-service";
import { notesService } from "@/services/note-service";
import { useEntry } from "@/hooks/use-entry";
import type { MouseEventHandler } from "react";
import { useEffect, useState } from "react";
import clsx from "clsx";

type TimelineView = DBSchema["timeline"];

export function Entry({
  id,
  type,
  content,
  value,
  created_at,
  status,
  pinned,
  has_image,
  label_name,
  onClick,
  compact = false,
}: TimelineView & { onClick?: () => void; compact?: boolean }) {
  return (
    <div
      className="rounded-xl px-2 py-4 mb-4 hover:bg-surface-tint transition-all flex gap-2.5 items-start"
      onClick={onClick}
    >
      <EntryGlyph id={id} type={type} status={status} value={value} />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="text-xs text-foreground-muted flex items-center gap-1">
          {formatTime(created_at)}
          {type === "note" && pinned === 1 && <PushPinSimpleIcon className="size-3" />}
          {type === "moment" && has_image === 1 && <ImageIcon className="size-3" />}
          {type === "mood" && value !== null && <span>· {moodLabel(value)}</span>}
        </div>
        {(content || (type === "moment" && has_image === 1)) && (
          <div className="flex gap-3 items-start">
            {content !== null && content !== "" && (
              <div
                className={clsx(
                  "flex-1 font-serif whitespace-pre-wrap",
                  compact && "text-sm line-clamp-3",
                )}
              >
                {content}
              </div>
            )}
            {type === "moment" && has_image === 1 && <MomentThumbnail id={id} />}
          </div>
        )}
        {label_name && (
          <div className="flex items-center gap-1 text-xs text-foreground-muted">
            <TagSimpleIcon className="size-3" />
            {label_name}
          </div>
        )}
      </div>
    </div>
  );
}

function MomentThumbnail({ id }: { id: string }) {
  const moment = useEntry("moment", id);
  const bytes = moment?.thumbnail ?? moment?.image ?? null;
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!bytes) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(new Blob([new Uint8Array(bytes)]));
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [bytes]);

  if (!url) return null;
  return (
    <img
      src={url}
      alt=""
      className="size-24 object-cover rounded-lg border border-border shrink-0"
    />
  );
}

function EntryGlyph(props: {
  id: string;
  type: "note" | "task" | "mood" | "moment";
  status: TaskTable["status"] | null;
  value: number | null;
}) {
  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    if (props.type === "task") {
      taskService.cycleStatus(props.id);
    } else if (props.type === "note") {
      notesService.togglePin(props.id);
    }
  };

  return (
    <button onClick={handleClick} className="rounded-lg hover:bg-surface-tint p-0.5 -mt-0.5">
      {props.type === "note" ? (
        <CircleIcon className="size-4" />
      ) : props.type === "mood" ? (
        <DiamondIcon className="size-4" style={{ color: moodColor((props.value ?? 0) / 100) }} />
      ) : props.type === "moment" ? (
        <TriangleIcon className="size-4" />
      ) : props.status === "complete" ? (
        <CheckSquareIcon className="size-4 text-accent" />
      ) : props.status === "cancelled" ? (
        <XSquareIcon className="size-4 text-foreground-muted" />
      ) : props.status === "deferred" ? (
        <ArrowSquareRightIcon className="size-4 text-foreground-muted" />
      ) : (
        <SquareIcon className="size-4" />
      )}
    </button>
  );
}

import {
  SquareIcon,
  CircleIcon,
  CheckSquareIcon,
  XSquareIcon,
  TagSimpleIcon,
} from "@phosphor-icons/react";
import type { DBSchema, TaskTable } from "@/db/schema";
import { formatTime } from "@/utils/dates";
import { taskService } from "@/services/task-service";
import { notesService } from "@/services/note-service";
import type { MouseEventHandler } from "react";
import clsx from "clsx";

type TimelineView = DBSchema["timeline"];

export function Entry({
  id,
  type,
  content,
  created_at,
  status,
  pinned,
  label_name,
  onClick,
  compact = false,
}: TimelineView & { onClick?: () => void; compact?: boolean }) {
  return (
    <div
      className="rounded-xl px-2 py-4 mb-4 hover:bg-neutral-700/50 transition-all flex gap-2.5 items-start"
      onClick={onClick}
    >
      <EntryGlyph id={id} type={type} status={status} pinned={pinned} />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="text-xs text-neutral-400">{formatTime(created_at)}</div>
        <div className={clsx(compact && "line-clamp-3")}>{content}</div>
        {label_name && (
          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <TagSimpleIcon className="size-3" />
            {label_name}
          </div>
        )}
      </div>
    </div>
  );
}

function EntryGlyph(props: {
  id: string;
  type: "task" | "note";
  status: TaskTable["status"] | null;
  pinned: number;
}) {
  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    if (props.type === "task") {
      taskService.cycleStatus(props.id);
    } else {
      notesService.togglePin(props.id);
    }
  };

  return (
    <button onClick={handleClick} className="rounded-lg hover:bg-neutral-50/10 p-0.5 -mt-0.5">
      {props.type === "note" ? (
        <CircleIcon weight={props.pinned ? "duotone" : "regular"} className="size-4.5" />
      ) : props.status === "complete" ? (
        <CheckSquareIcon className="size-4.5 text-yellow-200" />
      ) : props.status === "cancelled" ? (
        <XSquareIcon className="size-4.5 text-neutral-400" />
      ) : (
        <SquareIcon className="size-4.5" />
      )}
    </button>
  );
}

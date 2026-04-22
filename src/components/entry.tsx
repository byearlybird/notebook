import { SquareIcon, CircleIcon } from "@phosphor-icons/react";
import type { DBSchema } from "../db/schema";
import { formatTime } from "../utils/dates";

type TimelineView = DBSchema["timeline"];

export function Entry({
  type,
  content,
  created_at,
  onClick,
}: TimelineView & { onClick?: () => void }) {
  return (
    <div
      className="rounded-lg px-2 py-4 mb-4 hover:bg-neutral-700/50 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex gap-2.5 items-center mb-2">
        {type === "task" ? <SquareIcon className="size-4" /> : <CircleIcon className="size-4" />}
        <div className="text-xs text-neutral-400">{formatTime(created_at)}</div>
      </div>
      <div className="flex gap-2.5 items-center">
        <div className="size-4" />
        <div>{content}</div>
      </div>
    </div>
  );
}

import { LightningIcon, PenNibIcon } from "@phosphor-icons/react";
import { cx } from "cva";

type ActionNavbarProps = {
  hasIncompleteTasks: boolean;
  hasPriorTasks: boolean;
  onCreateClick: () => void;
  onPushpinClick: () => void;
};

export function ActionNavbar({
  hasIncompleteTasks,
  hasPriorTasks,
  onCreateClick,
  onPushpinClick,
}: ActionNavbarProps) {
  return (
    <div className="fixed right-[max(var(--safe-right),1rem)] bottom-[max(var(--safe-bottom),1rem)]">
      <div className="flex gap-1 rounded-lg border bg-slate-dark p-0.5 backdrop-blur">
        <button
          type="button"
          onClick={onPushpinClick}
          className="flex items-center justify-center gap-2 rounded-md px-3 py-2 min-h-11 text-ivory-light transition-transform duration-100 ease-in-out active:scale-105"
        >
          <LightningIcon
            className={cx("size-5", hasPriorTasks ? "text-gold-dark" : "text-ivory-light")}
            weight={hasIncompleteTasks ? "fill" : "regular"}
          />
        </button>
        <button
          type="button"
          onClick={onCreateClick}
          className="flex items-center justify-center gap-2 rounded-md px-3 py-2 text-ivory-light transition-transform duration-100 ease-in-out active:scale-105"
        >
          <PenNibIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}

import type { Task } from "@/models";
import { Renderer } from "@/components/lexical";
import { ArrowSquareRightIcon, CheckSquareIcon, XSquareIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { taskService } from "@/app";
import { useMutation } from "@/utils/use-mutation";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { cx } from "cva";

const UNDO_DELAY_MS = 3000;

type PendingUpdate = { action: "status"; status: Task["status"] } | { action: "rollover" };

export function TaskTab({
  todayTasks,
  priorTasks,
  open,
}: {
  todayTasks: Task[];
  priorTasks: Task[];
  open: boolean;
}) {
  const mutation = useMutation();
  const empty = todayTasks.length === 0 && priorTasks.length === 0;

  const [pendingUpdates, setPendingUpdates] = useState<Map<string, PendingUpdate>>(new Map());
  const pendingRef = useRef(pendingUpdates);
  pendingRef.current = pendingUpdates;
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commitPending = useCallback(() => {
    const updates = pendingRef.current;
    setPendingUpdates(new Map());
    commitTimerRef.current = null;
    const today = new Date().toLocaleDateString("en-CA");
    updates.forEach((update, taskId) => {
      if (update.action === "status")
        mutation(() => taskService.update(taskId, { status: update.status }));
      else mutation(() => taskService.rollover(taskId, today));
    });
  }, [mutation]);

  const schedulePendingCommit = () => {
    if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    commitTimerRef.current = setTimeout(commitPending, UNDO_DELAY_MS);
  };

  const handlePendingStatusChange = (id: string, status: Task["status"]) => {
    setPendingUpdates((prev) => new Map(prev).set(id, { action: "status", status }));
    schedulePendingCommit();
  };

  const handlePendingRollover = (id: string) => {
    setPendingUpdates((prev) => new Map(prev).set(id, { action: "rollover" }));
    schedulePendingCommit();
  };

  const handleUndo = (id: string) => {
    setPendingUpdates((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  useEffect(() => {
    if (!open) {
      if (commitTimerRef.current) {
        clearTimeout(commitTimerRef.current);
        commitTimerRef.current = null;
      }
      commitPending();
    }
  }, [open, commitPending]);

  if (empty) {
    return (
      <div className="flex size-full flex-col items-center justify-center">
        <p className="p-6 text-sm text-cloud-medium">You're all caught up</p>
      </div>
    );
  }

  return (
    <>
      {todayTasks.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-cloud-medium pb-2">
            Today
          </h3>
          <div className="flex flex-col">
            <AnimatePresence initial={false}>
              {todayTasks.map((task) => (
                <TodayTaskItem
                  key={task.id}
                  task={task}
                  isPending={pendingUpdates.get(task.id) !== undefined}
                  onComplete={() => handlePendingStatusChange(task.id, "complete")}
                  onCancel={() => handlePendingStatusChange(task.id, "canceled")}
                  onUndo={() => handleUndo(task.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}
      {priorTasks.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gold-dark pb-2">
            Prior
          </h3>
          <div className="flex flex-col">
            <AnimatePresence initial={false}>
              {priorTasks.map((task) => (
                <PriorTaskItem
                  key={task.id}
                  task={task}
                  isPending={pendingUpdates.get(task.id) !== undefined}
                  onRollover={() => handlePendingRollover(task.id)}
                  onComplete={() => handlePendingStatusChange(task.id, "complete")}
                  onCancel={() => handlePendingStatusChange(task.id, "canceled")}
                  onUndo={() => handleUndo(task.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}
    </>
  );
}

function TodayTaskItem({
  task,
  isPending,
  onComplete,
  onCancel,
  onUndo,
}: {
  task: Task;
  isPending: boolean;
  onComplete: () => void;
  onCancel: () => void;
  onUndo: () => void;
}) {
  return (
    <motion.div
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="overflow-hidden py-2 pb-2.5 flex flex-col gap-2"
    >
      <div className={cx("text-sm text-ivory-light", isPending && "line-through opacity-40")}>
        <Renderer content={task.content} />
      </div>
      {isPending ? (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onUndo}
            className="rounded-md bg-slate-light px-2.5 py-1.5 text-xs font-medium text-ivory-light transition-transform active:scale-105"
          >
            Undo
          </button>
        </div>
      ) : (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onComplete}
            className="flex items-center gap-1.5 rounded-md bg-slate-light px-2.5 py-1.5 text-xs font-medium text-ivory-light transition-transform active:scale-105"
          >
            <CheckSquareIcon className="size-3" />
            Complete
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 rounded-md bg-slate-light px-2.5 py-1.5 text-xs font-medium text-ivory-light transition-transform active:scale-105"
          >
            <XSquareIcon className="size-3" />
            Cancel
          </button>
        </div>
      )}
    </motion.div>
  );
}

function PriorTaskItem({
  task,
  isPending,
  onRollover,
  onComplete,
  onCancel,
  onUndo,
}: {
  task: Task;
  isPending: boolean;
  onRollover: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onUndo: () => void;
}) {
  // Append time component so parseISO treats it as local midnight, not UTC midnight
  const dateLabel = `${formatDistanceToNowStrict(parseISO(task.date + "T00:00:00"))} ago`;

  return (
    <motion.div
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="overflow-hidden py-2 flex flex-col gap-2"
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className={cx("text-sm text-ivory-light", isPending && "line-through opacity-40")}>
          <Renderer content={task.content} />
        </div>
        <span className="shrink-0 text-xs text-cloud-dark">{dateLabel}</span>
      </div>
      {isPending ? (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onUndo}
            className="rounded-md bg-slate-light px-2.5 py-1.5 text-xs font-medium text-ivory-light transition-transform active:scale-105"
          >
            Undo
          </button>
        </div>
      ) : (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onRollover}
            className="flex items-center gap-1.5 rounded-md bg-slate-light px-2.5 py-1.5 text-xs font-medium text-ivory-light transition-transform active:scale-105"
          >
            <ArrowSquareRightIcon className="size-3" />
            Roll over
          </button>
          <button
            type="button"
            onClick={onComplete}
            className="flex items-center gap-1.5 rounded-md bg-slate-light px-2.5 py-1.5 text-xs font-medium text-ivory-light transition-transform active:scale-105"
          >
            <CheckSquareIcon className="size-3" />
            Complete
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 rounded-md bg-slate-light px-2.5 py-1.5 text-xs font-medium text-ivory-light transition-transform active:scale-105"
          >
            <XSquareIcon className="size-3" />
            Cancel
          </button>
        </div>
      )}
    </motion.div>
  );
}

import type { Goal, Intention, Task } from "@/models";
import { Renderer } from "@/components/lexical";
import { TextareaDialog } from "@/components";
import {
  DialogBackdrop,
  DialogClose,
  DialogPopup,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "@/components/common/dialog";
import {
  ArrowSquareRightIcon,
  CheckSquareIcon,
  PlusIcon,
  StarIcon,
  XIcon,
  XSquareIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { taskService, goalService } from "@/app";
import { useMutation } from "@/utils/use-mutation";
import { IntentionSection } from "@/components/monthly-log";
import { useNavigate } from "@tanstack/react-router";
import { formatDistanceToNowStrict, parseISO } from "date-fns";

const UNDO_DELAY_MS = 3000;

type PendingUpdate = { action: "status"; status: Task["status"] } | { action: "rollover" };

export function TasksDialog({
  todayTasks,
  priorTasks,
  intention,
  goals,
  month,
  open,
  onClose,
}: {
  todayTasks: Task[];
  priorTasks: Task[];
  intention: Intention | null;
  goals: Goal[];
  month: string;
  open: boolean;
  onClose: () => void;
}) {
  const mutation = useMutation();
  const navigate = useNavigate();
  const empty = todayTasks.length === 0 && priorTasks.length === 0;
  const [activeTab, setActiveTab] = useState<"tasks" | "goals">("tasks");
  const [createGoalOpen, setCreateGoalOpen] = useState(false);

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
      if (update.action === "status") mutation(() => taskService.update(taskId, { status: update.status }));
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

  useEffect(() => {
    if (open) {
      setActiveTab("tasks");
    }
  }, [open]);

  return (
    <>
      <DialogRoot open={open} onOpenChange={onClose}>
        <AnimatePresence>
          {open && (
            <DialogPortal keepMounted>
              <DialogBackdrop
                render={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                }
              />
              <div className="fixed inset-x-0 -bottom-10 flex h-3/4 w-full max-w-2xl mx-auto">
                <DialogPopup
                  className="flex h-full w-full flex-col overflow-y-auto p-2 pb-[calc(var(--safe-bottom)+var(--spacing)*12)] border-x-0 border-b-0"
                  render={
                    <motion.div
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "100%", opacity: 0 }}
                      transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    />
                  }
                >
                  <DialogTitle>Tasks</DialogTitle>
                  <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-medium p-2">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveTab("tasks")}
                        className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${activeTab === "tasks" ? "bg-slate-light text-ivory-light" : "text-cloud-medium"}`}
                      >
                        Tasks
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("goals")}
                        className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${activeTab === "goals" ? "bg-slate-light text-ivory-light" : "text-cloud-medium"}`}
                      >
                        Month
                      </button>
                    </div>
                    <DialogClose className="flex size-8 ms-auto items-center justify-center rounded-full border bg-slate-medium text-ivory-light transition-transform duration-100 ease-in-out active:scale-105">
                      <XIcon className="h-4 w-4" />
                    </DialogClose>
                  </div>
                  <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-2 px-4">
                    {activeTab === "tasks" ? (
                      <>
                        {empty ? (
                          <div className="flex size-full flex-col items-center justify-center">
                            <p className="p-6 text-sm text-cloud-medium">You're all caught up</p>
                          </div>
                        ) : (
                          <>
                            {todayTasks.length > 0 && (
                              <section>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-cloud-medium pb-2">
                                  Today
                                </h3>
                                <div className="flex flex-col">
                                  <AnimatePresence initial={false}>
                                    {todayTasks.map((task) => (
                                      <motion.div
                                        key={task.id}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.25, ease: "easeInOut" }}
                                        className="overflow-hidden py-2 pb-2.5"
                                      >
                                        <TodayTaskItem
                                          task={task}
                                          isPending={pendingUpdates.get(task.id) !== undefined}
                                          onComplete={() =>
                                            handlePendingStatusChange(task.id, "complete")
                                          }
                                          onCancel={() =>
                                            handlePendingStatusChange(task.id, "canceled")
                                          }
                                          onUndo={() => handleUndo(task.id)}
                                        />
                                      </motion.div>
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
                                      <motion.div
                                        key={task.id}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.25, ease: "easeInOut" }}
                                        className="overflow-hidden py-2"
                                      >
                                        <PriorTaskItem
                                          task={task}
                                          isPending={pendingUpdates.get(task.id) !== undefined}
                                          onRollover={() => handlePendingRollover(task.id)}
                                          onComplete={() =>
                                            handlePendingStatusChange(task.id, "complete")
                                          }
                                          onCancel={() =>
                                            handlePendingStatusChange(task.id, "canceled")
                                          }
                                          onUndo={() => handleUndo(task.id)}
                                        />
                                      </motion.div>
                                    ))}
                                  </AnimatePresence>
                                </div>
                              </section>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <IntentionSection intention={intention} month={month} />
                        <div className="flex flex-col w-full">
                          {goals.map((goal, index) => (
                            <button
                              type="button"
                              key={goal.id}
                              className="flex gap-3 text-left"
                              onClick={() => {
                                onClose();
                                navigate({
                                  to: "/goal/$id",
                                  params: { id: goal.id },
                                });
                              }}
                            >
                              <div className="flex flex-col items-center">
                                <StarIcon
                                  weight={goal.status === "complete" ? "fill" : "regular"}
                                  className={
                                    goal.status === "complete"
                                      ? "size-4 text-gold-light"
                                      : "size-4 text-cloud-light"
                                  }
                                />
                                {index < goals.length - 1 && (
                                  <div className="w-px flex-1 border-r border-slate-light border-dotted my-1" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0 pb-4 min-h-10">
                                <Renderer content={goal.content} />
                              </div>
                            </button>
                          ))}
                          <button
                            type="button"
                            className="flex items-center gap-2 py-2 text-sm text-cloud-medium transition-colors active:text-cloud-light"
                            onClick={() => setCreateGoalOpen(true)}
                          >
                            <PlusIcon className="size-4" />
                            Add a goal
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </DialogPopup>
              </div>
            </DialogPortal>
          )}
        </AnimatePresence>
      </DialogRoot>
      <TextareaDialog
        open={createGoalOpen}
        onClose={() => setCreateGoalOpen(false)}
        onSave={async (content) => {
          await mutation(() => goalService.create(month, content));
          setCreateGoalOpen(false);
        }}
        title="New goal"
        initialContent=""
        placeholder="What do you want to achieve this month?"
      />
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
    <div className="flex flex-col gap-2">
      <div className={`text-sm text-ivory-light${isPending ? " line-through opacity-40" : ""}`}>
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
    </div>
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
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <div className={`text-sm text-ivory-light${isPending ? " line-through opacity-40" : ""}`}>
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
    </div>
  );
}

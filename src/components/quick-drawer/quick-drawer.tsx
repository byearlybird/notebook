import type { Goal, Intention, Task } from "@/models";
import {
  DrawerBackdrop,
  DrawerClose,
  DrawerPopup,
  DrawerPortal,
  DrawerRoot,
  DrawerTitle,
  DrawerViewport,
} from "@/components/common/drawer";
import { XIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { cx } from "cva";
import { TaskTab } from "./task-tab";
import { MonthlyTab } from "./monthly-tab";

export function QuickDrawer({
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
  const [activeTab, setActiveTab] = useState<"tasks" | "monthly">("tasks");

  useEffect(() => {
    if (open) {
      setActiveTab("tasks");
    }
  }, [open]);

  return (
    <DrawerRoot open={open} onOpenChange={onClose} swipeDirection="down">
      <DrawerPortal>
        <DrawerBackdrop />
        <DrawerViewport className="fixed inset-x-0 -bottom-10 flex h-3/4 w-full max-w-2xl mx-auto">
          <DrawerPopup className="flex h-full w-full flex-col overflow-y-auto p-2 pb-[calc(var(--safe-bottom)+var(--spacing)*12)] border-x-0 border-b-0">
            <DrawerTitle>Tasks</DrawerTitle>
            <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-medium p-2">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("tasks")}
                  className={cx(
                    "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    activeTab === "tasks"
                      ? "bg-slate-light text-ivory-light"
                      : "text-cloud-medium",
                  )}
                >
                  Tasks
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("monthly")}
                  className={cx(
                    "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    activeTab === "monthly"
                      ? "bg-slate-light text-ivory-light"
                      : "text-cloud-medium",
                  )}
                >
                  Month
                </button>
              </div>
              <DrawerClose className="flex size-8 ms-auto items-center justify-center rounded-full border bg-slate-medium text-ivory-light transition-transform duration-100 ease-in-out active:scale-105">
                <XIcon className="h-4 w-4" />
              </DrawerClose>
            </div>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-2 px-4">
              {activeTab === "tasks" ? (
                <TaskTab todayTasks={todayTasks} priorTasks={priorTasks} open={open} />
              ) : (
                <MonthlyTab
                  intention={intention}
                  goals={goals}
                  month={month}
                />
              )}
            </div>
          </DrawerPopup>
        </DrawerViewport>
      </DrawerPortal>
    </DrawerRoot>
  );
}

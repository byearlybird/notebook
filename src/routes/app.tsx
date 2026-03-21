import { ActionNavbar, Navbar, type NavItemData } from "@/components";
import { type Task } from "@/db";
import type { Goal, Intention } from "@/db/schema";
import { CreateDialog } from "@/features/entries";
import { TasksDialog } from "@/features/tasks";
import { goalService } from "@/app";
import { getIncompleteTasks } from "@/services/tasks-service";
import { getCurrentMonth } from "@/utils/date-utils";
import { ListBulletsIcon, SunHorizonIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { intentionService } from "@/app";

export const Route = createFileRoute("/app")({
  component: RouteComponent,
  loader: async () => {
    const currentMonth = getCurrentMonth();
    const [tasks, intention, goals] = await Promise.all([
      getIncompleteTasks(),
      intentionService.getByMonth(currentMonth),
      goalService.getByMonth(currentMonth),
    ]);
    return { ...tasks, intention: intention ?? null, goals, month: currentMonth };
  },
});

function RouteComponent() {
  const { todayTasks, priorTasks, intention, goals, month } = Route.useLoaderData();
  return (
    <AppLayout
      todayTasks={todayTasks}
      priorTasks={priorTasks}
      intention={intention}
      goals={goals}
      month={month}
    >
      <Outlet />
    </AppLayout>
  );
}

function AppLayout({
  children,
  todayTasks,
  priorTasks,
  intention,
  goals,
  month,
}: {
  children: React.ReactNode;
  todayTasks: Task[];
  priorTasks: Task[];
  intention: Intention | null;
  goals: Goal[];
  month: string;
}) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPushpinDialogOpen, setIsPushpinDialogOpen] = useState(false);

  const navItems: NavItemData[] = [
    {
      href: "/app",
      label: "Today",
      icon: SunHorizonIcon,
    },
    {
      href: "/app/entries",
      label: "All Entries",
      icon: ListBulletsIcon,
    },
  ];

  return (
    <>
      <div className="flex h-screen flex-col max-w-2xl mx-auto pt-safe-top">
        <div className="flex-1 overflow-y-auto pb-20">{children}</div>
        <div className="fixed left-[max(var(--safe-left),1rem)] bottom-[max(var(--safe-bottom),1rem)]">
          <Navbar navItems={navItems} />
        </div>
        <ActionNavbar
          hasIncompleteTasks={todayTasks.length > 0 || priorTasks.length > 0}
          hasPriorTasks={priorTasks.length > 0}
          onCreateClick={() => setIsCreateDialogOpen(true)}
          onPushpinClick={() => setIsPushpinDialogOpen(true)}
        />
      </div>
      <CreateDialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />
      <TasksDialog
        todayTasks={todayTasks}
        priorTasks={priorTasks}
        intention={intention}
        goals={goals}
        month={month}
        open={isPushpinDialogOpen}
        onClose={() => setIsPushpinDialogOpen(false)}
      />
    </>
  );
}

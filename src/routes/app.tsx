import { ActionNavbar, Navbar, type NavItemData } from "@/components";
import { type Task } from "@/db";
import { CreateDialog } from "@/features/entries";
import { TasksDialog } from "@/features/tasks";
import { getIncompleteTasks } from "@/services/tasks-service";
import { ListBulletsIcon, SunHorizonIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  component: RouteComponent,
  loader: () => getIncompleteTasks(),
});

function RouteComponent() {
  const { todayTasks, priorTasks } = Route.useLoaderData();
  return (
    <AppLayout todayTasks={todayTasks} priorTasks={priorTasks}>
      <Outlet />
    </AppLayout>
  );
}

function AppLayout({
  children,
  todayTasks,
  priorTasks,
}: {
  children: React.ReactNode;
  todayTasks: Task[];
  priorTasks: Task[];
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
        open={isPushpinDialogOpen}
        onClose={() => setIsPushpinDialogOpen(false)}
      />
    </>
  );
}

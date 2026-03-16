import { ActionNavbar, Navbar, type NavItemData } from "@app/components";
import { tasksRepo, type Task } from "@app/db";
import { CreateDialog } from "@app/features/entries";
import { TasksDialog } from "@app/features/tasks";
import { ListBulletsIcon, SunHorizonIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  component: RouteComponent,
  loader: async () => {
    const incompleteTasks = await tasksRepo.findIncomplete();
    return { incompleteTasks };
  },
});

function RouteComponent() {
  const { incompleteTasks } = Route.useLoaderData();
  return (
    <AppLayout incompleteTasks={incompleteTasks}>
      <Outlet />
    </AppLayout>
  );
}

function AppLayout({
  children,
  incompleteTasks,
}: {
  children: React.ReactNode;
  incompleteTasks: Task[];
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
          incompleteTasksCount={incompleteTasks.length}
          onCreateClick={() => setIsCreateDialogOpen(true)}
          onPushpinClick={() => setIsPushpinDialogOpen(true)}
        />
      </div>
      <CreateDialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />
      <TasksDialog
        incompleteTasks={incompleteTasks}
        open={isPushpinDialogOpen}
        onClose={() => setIsPushpinDialogOpen(false)}
      />
    </>
  );
}

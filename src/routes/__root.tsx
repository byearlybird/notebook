import { createRootRoute, Outlet } from "@tanstack/react-router";
import { migrator } from "../db/migrator";
import { useAutoSync } from "../hooks/use-auto-sync";
import { AppLayout } from "../components/app-layout";
import { Sidebar } from "../components/sidebar";

let hasMigrated = false;

export const Route = createRootRoute({
  beforeLoad: async () => {
    if (hasMigrated) return;
    await migrator.migrateToLatest();
    hasMigrated = true;
  },
  component: RootComponent,
});

function RootComponent() {
  useAutoSync();

  return (
    <AppLayout sidebar={<Sidebar />}>
      <Outlet />
    </AppLayout>
  );
}

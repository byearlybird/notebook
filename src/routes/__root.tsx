import { ErrorComponent, Loading } from "@/components";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { migrator } from "@/db";
import { Dialog } from "@capacitor/dialog";
import { SplashScreen } from "@capacitor/splash-screen";
import { seed } from "@/db/seed";

let migrated = false;

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: AppError,
  pendingComponent: AppLoading,
  beforeLoad: async () => {
    if (!migrated) {
      await Promise.all([
        migrator.migrateToLatest(),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);
      migrated = true;
      if (import.meta.env.DEV) await seed();
      await SplashScreen.hide();
    }
  },
});

function RootComponent() {
  return (
    <main className="[view-transition-name:main-content]">
      <Outlet />
    </main>
  );
}

function NotFoundComponent() {
  return <div className="mx-auto max-w-2xl p-4 text-ivory-light">404 - Page not found</div>;
}

function AppLoading() {
  return (
    <main className="flex h-screen items-center justify-center">
      <Loading />
    </main>
  );
}

function AppError(props: { error: Error }) {
  Dialog.alert({
    title: "Error",
    message: props.error.message,
  });
  return (
    <main className="flex size-full h-screen items-center justify-center">
      <ErrorComponent />
    </main>
  );
}

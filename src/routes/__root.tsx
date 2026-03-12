import { ErrorComponent, Loading } from "@app/components";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Dialog } from "@capacitor/dialog";
import { SplashScreen } from '@capacitor/splash-screen';

let initialized = false;

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: AppError,
  pendingComponent: AppLoading,
  beforeLoad: async () => {
    if (!initialized) {
      initialized = true;
      await SplashScreen.hide()
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

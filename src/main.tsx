import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ClerkProvider } from "@clerk/react";
import { routeTree } from "./routeTree.gen";
import { $userSettings, type Theme } from "./stores/user-settings";
import "./index.css";

const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

const resolveTheme = (theme: Theme): "dark" | "light" =>
  theme === "system" ? (systemDark.matches ? "dark" : "light") : theme;

const applyAccent = (accent: string) => {
  document.documentElement.dataset.accent = accent;
};
const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = resolveTheme(theme);
};

applyAccent($userSettings.get().accent);
applyTheme($userSettings.get().theme);

$userSettings.subscribe((settings) => {
  applyAccent(settings.accent);
  applyTheme(settings.theme);
});

systemDark.addEventListener("change", () => {
  if ($userSettings.get().theme === "system") applyTheme("system");
});

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      signUpForceRedirectUrl="/settings/sync"
      signInForceRedirectUrl="/settings/sync"
    >
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>,
);

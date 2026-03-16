import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import { SplashScreen } from "@capacitor/splash-screen";
import { Keyboard } from "@capacitor/keyboard";
import "./main.css";

// Create router instance
const router = createRouter({ routeTree, defaultViewTransition: true });

// TypeScript: Register router type
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Hide the splash (per Capacitor docs, you should do this on app launch)
await SplashScreen.hide();

// Show the splash for an indefinite amount of time:
await SplashScreen.show({
  autoHide: false,
});

await Keyboard.setAccessoryBarVisible({
  isVisible: false,
});

// biome-ignore lint/style/noNonNullAssertion: we know the element is always present
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

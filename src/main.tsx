import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ClerkProvider } from "@clerk/react";
import { routeTree } from "./routeTree.gen";
import { DBProvider } from "./db/context";
import { SyncProvider } from "./sync-context";
import { keyTransport, changeTransport } from "./api";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <DBProvider>
        <SyncProvider keyTransport={keyTransport} changeTransport={changeTransport}>
          <RouterProvider router={router} />
        </SyncProvider>
      </DBProvider>
    </ClerkProvider>
  </StrictMode>,
);

import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Show, SignInButton, SignOutButton, SignUpButton, UserButton } from "@clerk/react";
import { migrator } from "../db/migrator";

let hasMigrated = false;

export const Route = createRootRoute({
  beforeLoad: async () => {
    if (hasMigrated) return;
    await migrator.migrateToLatest();
    hasMigrated = true;
  },
  component: () => (
    <div className="min-h-screen">
      <nav className="flex items-center gap-4 border-b p-4">
        <Link to="/" className="[&.active]:font-bold">
          Index
        </Link>
        <Link to="/other" className="[&.active]:font-bold">
          Other
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Show when="signed-out">
            <SignInButton />
            <SignUpButton />
          </Show>
          <Show when="signed-in">
            <UserButton />
            <SignOutButton />
          </Show>
        </div>
      </nav>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  ),
});

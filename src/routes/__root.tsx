import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Show, SignInButton, SignUpButton, UserButton, useClerk } from "@clerk/react";
import { migrator } from "../db/migrator";
import { lockVault } from "../vault";

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
  const { signOut } = useClerk();

  async function handleSignOut() {
    await lockVault();
    await signOut();
  }

  return (
    <div className="h-screen flex flex-col">
      <nav className="flex items-center border-b px-4 py-3 shrink-0">
        <Link to="/" className="text-sm font-semibold">
          Todos
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton />
            <SignUpButton />
          </Show>
          <Show when="signed-in">
            <UserButton />
            <button className="text-sm" onClick={handleSignOut}>
              Sign out
            </button>
          </Show>
        </div>
      </nav>
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

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
            <button onClick={handleSignOut}>Sign out</button>
          </Show>
        </div>
      </nav>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}

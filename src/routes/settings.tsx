import { createFileRoute, Link, linkOptions, Outlet } from "@tanstack/react-router";
import { Show, SignInButton, UserButton } from "@clerk/react";

const navItems = linkOptions([
  { to: "/settings", label: "Labels", activeOptions: { exact: true } },
  { to: "/settings/theme", label: "Theme" },
  { to: "/settings/sync", label: "Sync" },
]);

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-1 size-full overflow-hidden">
      <section className="pt-2 pr-4 shrink-0 px-2 space-y-2 border-r border-border min-w-50 flex flex-col">
        {navItems.map(({ label, ...item }) => (
          <Link
            key={item.to}
            {...item}
            className="block px-3 py-2 w-full rounded-2xl transition-all hover:bg-foreground/5"
            activeProps={{ className: "bg-background" }}
          >
            {label}
          </Link>
        ))}
        <div className="mt-auto pt-2 border-t border-dashed border-border">
          <Show when="signed-out">
            <SignInButton>
              <button className="block px-3 py-2 w-full rounded-2xl transition-all hover:bg-foreground/5 text-left">
                Sign in
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <div className="px-3 py-2 flex items-center gap-2">
              <UserButton />
              <span className="text-sm">Account</span>
            </div>
          </Show>
        </div>
      </section>
      <div className="flex-1 min-w-0 overflow-auto p-2 pl-4">
        <Outlet />
      </div>
    </div>
  );
}

import { createFileRoute, Link, linkOptions, Outlet } from "@tanstack/react-router";

const navItems = linkOptions([
  { to: "/settings", label: "Labels", activeOptions: { exact: true } },
  { to: "/settings/profile", label: "Account" },
]);

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-1 size-full overflow-hidden">
      <section className="pt-2 pr-4 shrink-0 px-2 space-y-2 border-r border-neutral-700">
        {navItems.map(({ label, ...item }) => (
          <Link
            key={item.to}
            {...item}
            className="block px-3 py-2 w-full rounded-2xl transition-all hover:bg-neutral-900/50"
            activeProps={{ className: "bg-neutral-900 " }}
          >
            {label}
          </Link>
        ))}
      </section>
      <div className="flex-1 min-w-0 overflow-auto p-2 pl-4">
        <Outlet />
      </div>
    </div>
  );
}

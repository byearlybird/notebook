import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
    component: () => (
        <div className="min-h-screen">
            <nav className="flex gap-4 border-b p-4">
                <Link to="/" className="[&.active]:font-bold">
                    Index
                </Link>
                <Link to="/other" className="[&.active]:font-bold">
                    Other
                </Link>
            </nav>
            <main className="p-4">
                <Outlet />
            </main>
        </div>
    ),
});

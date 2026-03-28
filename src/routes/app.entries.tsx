import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/entries")({
  beforeLoad: () => {
    throw redirect({ to: "/app", search: { view: "entries" } });
  },
});

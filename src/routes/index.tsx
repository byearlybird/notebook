import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <div>
      <h1 className="text-2xl font-bold">Index</h1>
      <p className="mt-2 text-gray-600">Welcome to the index route.</p>
    </div>
  ),
});

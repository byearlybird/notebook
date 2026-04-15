import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/other")({
  component: () => (
    <div>
      <h1 className="text-2xl font-bold">Other</h1>
      <p className="mt-2 text-gray-600">This is the other tab.</p>
    </div>
  ),
});

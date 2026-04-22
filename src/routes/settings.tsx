import { UserProfile } from "@clerk/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <UserProfile
      appearance={{
        elements: {
          rootBox: "size-full!",
          cardBox: "size-full!",
        },
      }}
    />
  );
}

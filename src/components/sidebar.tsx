import { Link, linkOptions, useMatchRoute, type LinkProps } from "@tanstack/react-router";
import { Show, SignInButton } from "@clerk/react";
import {
  SunHorizonIcon,
  ListBulletsIcon,
  GearIcon,
  PushPinSimpleIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Button } from "./button";
import { PinnedNotesPreview } from "./pinned-notes-preview";

const navItems = linkOptions([
  { to: "/", label: "Today", Icon: SunHorizonIcon },
  { to: "/timeline", label: "Timeline", Icon: ListBulletsIcon },
]);

function NavButton({ to, children }: { to: LinkProps["to"]; children: ReactNode }) {
  const match = useMatchRoute();
  return (
    <Button
      nativeButton={false}
      variant={match({ to }) ? "outline" : "ghost"}
      render={(props) => <Link {...props} to={to} viewTransition />}
    >
      {children}
    </Button>
  );
}

export function Sidebar() {
  return (
    <div className="size-full space-y-2 z-50 flex flex-col px-2 rounded-xl">
      {navItems.map(({ Icon, label, to }) => (
        <NavButton to={to} key={to}>
          <Icon />
          {label}
        </NavButton>
      ))}
      <PinnedNotesPreview>
        <Button variant="ghost">
          <PushPinSimpleIcon />
          Pins
        </Button>
      </PinnedNotesPreview>
      <div className="mt-auto">
        <Show when="signed-in">
          <NavButton to="/settings">
            <GearIcon />
            Settings
          </NavButton>
        </Show>
        <Show when="signed-out">
          <SignInButton />
        </Show>
      </div>
    </div>
  );
}

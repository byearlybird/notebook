import { Link, linkOptions, useMatchRoute, type LinkProps } from "@tanstack/react-router";
import {
  SunHorizonIcon,
  ListBulletsIcon,
  GearIcon,
  PushPinSimpleIcon,
  ArrowSquareRightIcon,
  GlobeSimpleXIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useStore } from "@nanostores/react";
import { Button } from "./shared/button";
import { PinnedNotesPreview } from "./pinned-notes-preview";
import { RolloverTasksPreview } from "./rollover-tasks-preview";
import { IntentionPreview } from "./intention-preview";
import { usePriorTasks } from "@/hooks/use-prior-tasks";
import { $syncState } from "@/stores/sync-client";

const navItems = linkOptions([
  { to: "/", label: "Today", Icon: SunHorizonIcon },
  { to: "/timeline", label: "Timeline", Icon: ListBulletsIcon },
]);

function NavButton({ to, children }: { to: LinkProps["to"]; children: ReactNode }) {
  const match = useMatchRoute();
  return (
    <Button
      align="start"
      nativeButton={false}
      variant={match({ to }) ? "outline" : "ghost"}
      render={(props) => <Link {...props} to={to} viewTransition />}
    >
      {children}
    </Button>
  );
}

export function Sidebar() {
  const priorTasks = usePriorTasks();
  const hasPriorTasks = !!priorTasks?.length;
  const syncState = useStore($syncState);

  return (
    <div className="size-full space-y-2 z-50 flex flex-col px-2 rounded-xl">
      {navItems.map(({ Icon, label, to }) => (
        <NavButton to={to} key={to}>
          <Icon />
          {label}
        </NavButton>
      ))}
      <div className="h-1 my-3 border-t border-dashed w-full border-border" />
      <PinnedNotesPreview>
        <Button variant="ghost" align="start">
          <PushPinSimpleIcon />
          Pins
        </Button>
      </PinnedNotesPreview>
      <RolloverTasksPreview>
        <Button variant="ghost" align="start">
          <ArrowSquareRightIcon className={hasPriorTasks ? "text-accent" : undefined} />
          Prior tasks
        </Button>
      </RolloverTasksPreview>

      <div className="mt-auto space-y-2">
        <IntentionPreview />
        <div className="border-t border-dashed border-border mt-4 mb-4 space-y-2" />
        {syncState.status !== "unlocked" && (
          <p className="text-foreground-muted w-fit px-3 py-0.5 rounded-full flex items-center justify-center gap-2 text-sm border border-accent-foreground/10">
            <GlobeSimpleXIcon />
            Not syncing
          </p>
        )}
        <NavButton to="/settings">
          <GearIcon />
          Settings
        </NavButton>
      </div>
    </div>
  );
}

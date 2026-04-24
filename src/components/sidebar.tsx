import { Link, linkOptions, useMatchRoute, type LinkProps } from "@tanstack/react-router";
import {
  SunHorizonIcon,
  ListBulletsIcon,
  GearIcon,
  PushPinSimpleIcon,
  ArrowSquareRightIcon,
  StarIcon,
  GlobeSimpleXIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useStore } from "@nanostores/react";
import { Button } from "./button";
import { PinnedNotesPreview } from "./pinned-notes-preview";
import { RolloverTasksPreview } from "./rollover-tasks-preview";
import { IntentionPreview } from "./intention-preview";
import { usePriorTasks } from "@/hooks/use-prior-tasks";
import { useMonthIntention } from "@/hooks/use-month-intention";
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
  const monthIntention = useMonthIntention();
  const hasIntention = !!monthIntention;
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
      <IntentionPreview>
        <Button variant="ghost" align="start">
          <StarIcon className={!hasIntention ? "text-accent" : undefined} />
          Intention
        </Button>
      </IntentionPreview>

      <div className="mt-auto space-y-2">
        {syncState.status !== "unlocked" && (
          <p className="border border-accent w-fit px-2 py-1 mx-auto rounded-full flex items-center justify-center gap-2 text-sm text-accent">
            <GlobeSimpleXIcon />
            Not syncing
          </p>
        )}
        <div className="border-t border-dashed border-border mt-4 space-y-2" />
        <NavButton to="/settings">
          <GearIcon />
          Settings
        </NavButton>
      </div>
    </div>
  );
}

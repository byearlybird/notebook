import { Link, linkOptions, useMatchRoute, type LinkProps } from "@tanstack/react-router";
import { Show, SignInButton } from "@clerk/react";
import {
  SunHorizonIcon,
  ListBulletsIcon,
  GearIcon,
  PushPinSimpleIcon,
  ArrowSquareRightIcon,
  StarIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Button } from "./button";
import { PinnedNotesPreview } from "./pinned-notes-preview";
import { RolloverTasksPreview } from "./rollover-tasks-preview";
import { IntentionPreview } from "./intention-preview";
import { usePriorTasks } from "@/hooks/use-prior-tasks";
import { useMonthIntention } from "@/hooks/use-month-intention";

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
  const priorTasks = usePriorTasks();
  const hasPriorTasks = !!priorTasks?.length;
  const monthIntention = useMonthIntention();
  const hasIntention = !!monthIntention;

  return (
    <div className="size-full space-y-2 z-50 flex flex-col px-2 rounded-xl">
      {navItems.map(({ Icon, label, to }) => (
        <NavButton to={to} key={to}>
          <Icon />
          {label}
        </NavButton>
      ))}
      <div className="h-1 my-2 border-t border-dashed w-full border-neutral-700" />
      <PinnedNotesPreview>
        <Button variant="ghost">
          <PushPinSimpleIcon />
          Pins
        </Button>
      </PinnedNotesPreview>
      <RolloverTasksPreview>
        <Button variant="ghost">
          <ArrowSquareRightIcon className={hasPriorTasks ? "text-yellow-300" : undefined} />
          Prior tasks
        </Button>
      </RolloverTasksPreview>
      <IntentionPreview>
        <Button variant="ghost">
          <StarIcon className={!hasIntention ? "text-yellow-300" : undefined} />
          Intention
        </Button>
      </IntentionPreview>
      <div className="mt-auto border-t border-dashed border-neutral-700 pt-4">
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

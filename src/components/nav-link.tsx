import React from "react";
import { createLink, type LinkComponent } from "@tanstack/react-router";

type NavLinkInnerProps = React.HTMLAttributes<HTMLDivElement> & {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

const NavLinkInner = React.forwardRef<HTMLDivElement, NavLinkInnerProps>(
  ({ icon: Icon, label, ...props }, ref) => (
    <div
      ref={ref}
      {...props}
      className="flex items-center gap-2.5 px-3 py-2 w-full rounded-2xl hover:bg-foreground/10 data-[status=active]:bg-surface transition-all"
    >
      <Icon className="size-4" />
      {label}
    </div>
  ),
);

export const NavLink: LinkComponent<typeof NavLinkInner> = createLink(NavLinkInner);

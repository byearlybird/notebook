import { linkOptions } from "@tanstack/react-router";
import { Show, SignInButton } from "@clerk/react";
import { SunHorizonIcon, ListBulletsIcon, GearIcon } from "@phosphor-icons/react";
import { NavLink } from "./nav-link";

const navItems = linkOptions([
  { to: "/", label: "Today", icon: SunHorizonIcon },
  { to: "/timeline", label: "Timeline", icon: ListBulletsIcon },
]);

export function Sidebar() {
  return (
    <div className="size-full space-y-2 z-50 flex flex-col p-2 rounded-xl">
      {navItems.map(({ icon, label, ...item }) => (
        <NavLink key={item.to} {...item} icon={icon} label={label} />
      ))}
      <div className="mt-auto">
        <Show when="signed-in">
          <NavLink to="/settings" icon={GearIcon} label="Settings" />
        </Show>
        <Show when="signed-out">
          <SignInButton />
        </Show>
      </div>
    </div>
  );
}

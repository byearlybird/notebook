import { type Icon } from "@phosphor-icons/react";
import { useMatchRoute, useRouter, type LinkProps } from "@tanstack/react-router";
import { cx } from "cva";

export type NavItemData = {
  href: LinkProps["to"];
  label: string;
  icon: Icon;
};

type NavbarProps = {
  navItems: NavItemData[];
};

export function Navbar({ navItems }: NavbarProps) {
  return (
    <nav className="flex gap-1 rounded-lg border bg-slate-dark p-0.5 backdrop-blur">
      {navItems.map((item) => (
        <NavItem key={item.href} {...item} />
      ))}
    </nav>
  );
}

function NavItem({ href, label, icon: Icon }: NavItemData) {
  const match = useMatchRoute();
  const router = useRouter();
  const isActive = match({ to: href });

  const handleClick = () => {
    router.navigate({ to: href });
  };

  return (
    <button
      onClick={handleClick}
      className={cx(
        "flex items-center gap-2 rounded-md px-3 py-2 transition-transform duration-100 ease-in-out active:scale-105 [&>svg]:size-4",
        isActive && "border bg-slate-light text-ivory-light backdrop-blur",
      )}
    >
      <Icon className="size-4" />
      {isActive ? label : null}
    </button>
  );
}

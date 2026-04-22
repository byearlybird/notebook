import type { ReactNode } from "react";

export function Page({ children }: { children: ReactNode }) {
  return <div className="h-full px-2 pb-2 overflow-y-auto">{children}</div>;
}

export function PageHeader({ children }: { children: ReactNode }) {
  return (
    <div className="sticky top-0 z-10 bg-neutral-800 flex items-center justify-between py-2 mb-4 border-neutral-700 border-b border-dashed">
      {children}
    </div>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-2xl font-bold font-serif">{children}</h1>;
}

export function PageActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}

import type { ReactNode } from "react";

export function Page({ children }: { children: ReactNode }) {
  return <div className="h-full flex flex-col px-1 pb-2 overflow-y-auto">{children}</div>;
}

export function PageHeader({ children }: { children: ReactNode }) {
  return (
    <div className="sticky px-3 top-0 z-10 bg-surface flex items-center justify-between gap-6 py-2 mb-4 border-border border-b border-dashed">
      {children}
    </div>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-xl font-semibold shrink-0 whitespace-nowrap">{children}</h1>;
}

export function PageActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}

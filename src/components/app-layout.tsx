import { useState } from "react";
import type { ReactNode } from "react";
import { Drawer } from "@base-ui/react/drawer";
import { ListIcon } from "@phosphor-icons/react";

type AppLayoutProps = { sidebar: ReactNode; children: ReactNode };

export function AppLayout(props: AppLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="sm:hidden fixed top-0 inset-x-0 h-10 flex items-center px-4">
        <button onClick={() => setDrawerOpen(true)}>
          <ListIcon className="size-5" />
        </button>
      </header>

      <aside className="hidden sm:block fixed left-0 inset-y-0 w-52 p-2">{props.sidebar}</aside>

      <main className="fixed top-10 sm:top-0 left-0 sm:left-52 inset-y-0 right-0 p-2 flex flex-col gap-2">
        <div className="bg-neutral-800 rounded-2xl flex-1 min-h-0 overflow-auto p-2 outline outline-neutral-700">
          {props.children}
        </div>
      </main>

      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen} swipeDirection="left">
        <Drawer.Portal>
          <Drawer.Backdrop className="fixed inset-0 bg-black/50 data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity duration-300" />
          <Drawer.Viewport className="fixed inset-0 flex items-stretch justify-start">
            <Drawer.Popup className="w-52 h-full bg-neutral-900 transition-transform duration-300 data-starting-style:-translate-x-full data-ending-style:-translate-x-full">
              <Drawer.Content className="h-full p-2 border-r border-neutral-200/10">
                {props.sidebar}
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

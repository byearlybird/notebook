import { useState } from "react";
import type { ReactNode } from "react";
import { Drawer } from "@base-ui/react/drawer";
import { ListIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "./button";
import { CreateDialog } from "./create-dialog";

type AppLayoutProps = { sidebar: ReactNode; children: ReactNode };

export function AppLayout(props: AppLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <header className="sm:hidden fixed top-0 inset-x-0 h-14 flex items-center justify-between px-2">
        <Button variant="outline" onClick={() => setDrawerOpen(true)}>
          <ListIcon className="size-5" />
        </Button>
        <Button onClick={() => setCreateOpen(true)}>
          Create <PlusIcon />
        </Button>
      </header>

      <aside className="hidden sm:block fixed left-0 inset-y-0 w-44 p-2">{props.sidebar}</aside>

      {/* pointer-events-none lets sidebar clicks pass through the transparent main area on mobile */}
      <main className="pointer-events-none fixed top-14 sm:top-0 left-0 inset-y-0 right-0 px-2 pb-2 pt-1 sm:pt-2 sm:pl-[max(11rem,calc(50%-28rem))] sm:pr-[max(0.5rem,calc(50%-28rem))] flex flex-col gap-2">
        <div className="pointer-events-auto hidden sm:flex justify-end">
          <Button onClick={() => setCreateOpen(true)}>
            Create <PlusIcon />
          </Button>
        </div>
        <div className="pointer-events-auto max-w-4xl w-full bg-neutral-800 rounded-2xl flex-1 min-h-0 overflow-auto p-2 outline outline-neutral-700">
          {props.children}
        </div>
      </main>

      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen} swipeDirection="left">
        <Drawer.Portal>
          <Drawer.Backdrop className="fixed inset-0 bg-black/50 data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity duration-300" />
          <Drawer.Viewport className="fixed inset-0 flex items-stretch justify-start">
            <Drawer.Popup className="w-44 h-full bg-neutral-900 transition-transform duration-300 data-starting-style:-translate-x-full data-ending-style:-translate-x-full">
              <Drawer.Content className="h-full p-2 border-r border-neutral-200/10">
                {props.sidebar}
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>

      <CreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}

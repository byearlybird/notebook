import type { Intention, Note, Task } from "@/models";
import {
  DrawerContent,
  DrawerRoot,
  DrawerTab,
  DrawerTabList,
  DrawerTabPanel,
  DrawerTabRoot,
  DrawerTitle,
} from "@/components/common/drawer";
import { TaskTab } from "./task-tab";
import { PinnedTab } from "./pinned-tab";

export function QuickDrawer({
  todayTasks,
  priorTasks,
  intention,
  month,
  pinnedNotes,
  open,
  onClose,
}: {
  todayTasks: Task[];
  priorTasks: Task[];
  intention: Intention | null;
  month: string;
  pinnedNotes: Note[];
  open: boolean;
  onClose: () => void;
}) {
  return (
    <DrawerRoot open={open} onOpenChange={onClose} swipeDirection="down">
      <DrawerContent>
        <DrawerTitle>Tasks</DrawerTitle>
        <DrawerTabRoot defaultValue="tasks">
          <DrawerTabList>
            <DrawerTab value="tasks">Tasks</DrawerTab>
            <DrawerTab value="pinned">Pinned</DrawerTab>
          </DrawerTabList>
          <DrawerTabPanel value="tasks">
            <TaskTab todayTasks={todayTasks} priorTasks={priorTasks} open={open} />
          </DrawerTabPanel>
          <DrawerTabPanel value="pinned">
            <PinnedTab intention={intention} month={month} pinnedNotes={pinnedNotes} />
          </DrawerTabPanel>
        </DrawerTabRoot>
      </DrawerContent>
    </DrawerRoot>
  );
}

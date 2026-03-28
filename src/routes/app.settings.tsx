import { useState } from "react";
import {
  DownloadSimpleIcon,
  ExportIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { ExportDialog } from "@/components/entries/export-dialog";
import { ImportDialog } from "@/components/entries/import-dialog";
import { MenuButton, MenuContent, MenuItem, MenuRoot } from "@/components";
import { labelService } from "@/app";
import { useMutation } from "@/utils/use-mutation";
import { Dialog } from "@capacitor/dialog";
import { createFileRoute } from "@tanstack/react-router";
import type { Label } from "@/models";

export const Route = createFileRoute("/app/settings")({
  component: RouteComponent,
  loader: async () => ({ labels: await labelService.getAll() }),
});

function RouteComponent() {
  const { labels } = Route.useLoaderData();

  return (
    <div className="px-4 py-2 space-y-4">
      <header className="sticky top-0 backdrop-blur-md bg-slate-medium py-1">
        <span className="text-2xl font-extrabold">Settings</span>
      </header>
      <DataSection />
      <LabelsSection labels={labels} />
    </div>
  );
}

function DataSection() {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  return (
    <section className="space-y-1">
      <h2 className="font-medium px-2">Data</h2>
      <div className="flex flex-col divide-y items-center rounded-lg border border-slate-light bg-slate-medium">
        <button
          type="button"
          onClick={() => setIsExportDialogOpen(true)}
          className="flex items-center justify-between w-full p-4 transition-transform active:scale-[0.99]"
        >
          <span>Export data</span>
          <ExportIcon className="size-4 text-cloud-medium" />
        </button>
        <button
          type="button"
          onClick={() => setIsImportDialogOpen(true)}
          className="flex items-center justify-between w-full p-4 transition-transform active:scale-[0.99]"
        >
          <span>Import data</span>
          <DownloadSimpleIcon className="size-4 text-cloud-medium" />
        </button>
      </div>
      <ExportDialog open={isExportDialogOpen} onClose={() => setIsExportDialogOpen(false)} />
      <ImportDialog open={isImportDialogOpen} onClose={() => setIsImportDialogOpen(false)} />
    </section>
  );
}

function LabelsSection({ labels }: { labels: Label[] }) {
  const mutate = useMutation();

  const handleCreate = async () => {
    const { value, cancelled } = await Dialog.prompt({
      title: "New Label",
      message: "Enter a name for the label",
      inputPlaceholder: "Label name",
      okButtonTitle: "Save",
    });
    if (cancelled || !value.trim()) return;
    await mutate(() => labelService.create(value.trim()));
  };

  const handleEdit = async (label: Label) => {
    const { value, cancelled } = await Dialog.prompt({
      title: "Rename Label",
      message: "Enter a new name for the label",
      inputPlaceholder: "Label name",
      inputText: label.name,
      okButtonTitle: "Save",
    });
    if (cancelled || !value.trim()) return;
    await mutate(() => labelService.update(label.id, value.trim()));
  };

  const handleDelete = async (label: Label) => {
    await mutate(() => labelService.delete(label.id));
  };

  return (
    <section className="space-y-1">
      <div className="flex items-center justify-between px-2">
        <h2 className="font-medium">Labels</h2>
        <button
          type="button"
          onClick={handleCreate}
          className="flex size-8 items-center justify-center rounded-md transition-transform active:scale-105"
          aria-label="Create label"
        >
          <PlusIcon className="size-4" />
        </button>
      </div>
      {labels.length === 0 ? (
        <div className="rounded-lg border border-slate-light bg-slate-medium p-4 text-center text-sm text-cloud-medium">
          No labels yet
        </div>
      ) : (
        <div className="flex flex-col divide-y rounded-lg border border-slate-light bg-slate-medium">
          {labels.map((label) => (
            <div key={label.id} className="flex items-center justify-between p-4">
              <span>{label.name}</span>
              <MenuRoot>
                <MenuButton />
                <MenuContent>
                  <MenuItem onClick={() => handleEdit(label)}>
                    <PencilSimpleIcon className="size-4" />
                    Edit
                  </MenuItem>
                  <MenuItem variant="destructive" onClick={() => handleDelete(label)}>
                    <TrashIcon className="size-4" />
                    Delete
                  </MenuItem>
                </MenuContent>
              </MenuRoot>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

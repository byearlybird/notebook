import { useState } from "react";
import { CaretLeftIcon, DownloadSimpleIcon, ExportIcon } from "@phosphor-icons/react";
import { SwipeBackEdge } from "@/components/swipe-back-edge";
import { ExportDialog } from "@/components/entries/export-dialog";
import { ImportDialog } from "@/components/entries/import-dialog";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const goBack = () => {
    navigate({ to: "/app", viewTransition: { types: ["slide-right"] } });
  };

  return (
    <div className="flex min-h-screen flex-col space-y-4 max-w-2xl mx-auto pt-safe-top pb-safe-bottom">
      <header className="flex items-center gap-2 px-4 py-2">
        <button
          type="button"
          onClick={goBack}
          className="flex size-10 shrink-0 items-center justify-center rounded-md transition-transform active:scale-105"
          aria-label="Go back"
        >
          <CaretLeftIcon className="size-6" />
        </button>
        <div className="flex-1 text-center">
          <span className="font-medium">Settings</span>
        </div>
        <div className="size-10 shrink-0" />
      </header>
      <DataSection />
      <SwipeBackEdge onBack={goBack} />
    </div>
  );
}

function DataSection() {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  return (
    <section className="px-4 pt-4 space-y-1">
      <h2 className="font-medium px-2">Data</h2>
      <div className="flex flex-col divide-y items-center rounded-lg border border-slate-light bg-slate-medium">
        <button
          type="button"
          onClick={() => setIsExportDialogOpen(true)}
          className="flex items-center justify-between w-full p-4 transition-transform active:scale-[0.99]"
        >
          <span>Export data</span>
          <ExportIcon className="size-5 text-cloud-medium" />
        </button>
        <button
          type="button"
          onClick={() => setIsImportDialogOpen(true)}
          className="flex items-center justify-between w-full p-4 transition-transform active:scale-[0.99]"
        >
          <span>Import data</span>
          <DownloadSimpleIcon className="size-5 text-cloud-medium" />
        </button>
      </div>
      <ExportDialog open={isExportDialogOpen} onClose={() => setIsExportDialogOpen(false)} />
      <ImportDialog open={isImportDialogOpen} onClose={() => setIsImportDialogOpen(false)} />
    </section>
  );
}

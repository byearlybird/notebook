import { Dialog } from "@base-ui/react/dialog";
import { cx } from "cva";
import type { ComponentProps } from "react";

export const DialogRoot = Dialog.Root;

export function DialogTrigger({ className, ...props }: ComponentProps<typeof Dialog.Trigger>) {
  return <Dialog.Trigger className={cx("cursor-default", className)} {...props} />;
}

export const DialogPortal = Dialog.Portal;

export function DialogBackdrop({ className, ...props }: ComponentProps<typeof Dialog.Backdrop>) {
  return <Dialog.Backdrop className={cx("fixed inset-0 bg-slate-dark/80", className)} {...props} />;
}

export function DialogPopup({ className, ...props }: ComponentProps<typeof Dialog.Popup>) {
  return <Dialog.Popup className={cx("rounded-lg border bg-slate-medium", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof Dialog.Title>) {
  return <Dialog.Title className={cx("sr-only", className)} {...props} />;
}

export const DialogDescription = Dialog.Description;

export function DialogClose({ className, ...props }: ComponentProps<typeof Dialog.Close>) {
  return <Dialog.Close className={cx("cursor-default", className)} {...props} />;
}

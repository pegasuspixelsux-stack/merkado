"use client";

import { useEffect, useRef } from "react";

// Native <dialog>: focus trap, Escape to close and inert background come from the browser.
export default function Modal({
  open,
  onClose,
  labelledBy,
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      // The dialog has no padding, so a click whose target is the dialog itself is the backdrop.
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto max-h-[90dvh] w-[min(34rem,calc(100%-2rem))] overflow-y-auto rounded-3xl border border-walnut/15 bg-cream p-0 text-walnut shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100"
    >
      {open && children}
    </dialog>
  );
}

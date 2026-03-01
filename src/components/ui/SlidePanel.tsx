"use client";

/**
 * SlidePanel
 *
 * A right-side drawer/panel with a dark backdrop. Used for forms and
 * detail views that don't need to cover the entire content area.
 *
 * Usage:
 *   <SlidePanel open={isOpen} onClose={handleClose} title="Edit Facility">
 *     …children…
 *   </SlidePanel>
 */

import { useEffect, type ReactNode } from "react";

interface SlidePanelProps {
  /** Controls visibility */
  open: boolean;
  /** Called when backdrop or the close button is clicked */
  onClose: () => void;
  /** Accessible title (also shown in aria-label) */
  title?: string;
  /** Tailwind max-width class for the panel. Defaults to "max-w-xl". */
  maxWidth?: string;
  children: ReactNode;
}

export default function SlidePanel({
  open,
  onClose,
  title,
  maxWidth = "max-w-xl",
  children,
}: SlidePanelProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Full-screen backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 mt-0"
        style={{ marginTop: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full ${maxWidth} bg-white shadow-2xl z-50 flex flex-col mt-0`}
        style={{ marginTop: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {children}
      </div>
    </>
  );
}

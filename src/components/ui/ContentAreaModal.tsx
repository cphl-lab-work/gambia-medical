"use client";

/**
 * ContentAreaModal
 *
 * A full-height modal that covers the main content area while leaving
 * the sidebar visible. It reads --sidebar-w (set by DashboardLayout) to
 * know where the sidebar ends, so it works for both expanded (224 px)
 * and collapsed (64 px) states.
 *
 * Usage:
 *   <ContentAreaModal open={isOpen} onClose={handleClose} title="My Modal">
 *     …children…
 *   </ContentAreaModal>
 */

import { useEffect, type ReactNode } from "react";

interface ContentAreaModalProps {
  /** Controls visibility */
  open: boolean;
  /** Called when backdrop or close button is clicked */
  onClose: () => void;
  /** Accessible title shown in the aria-label attribute */
  title?: string;
  children: ReactNode;
}

export default function ContentAreaModal({
  open,
  onClose,
  title,
  children,
}: ContentAreaModalProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const sidebarOffset = { left: "var(--sidebar-w, 224px)" } as React.CSSProperties;

  return (
    <>
      {/* Dim backdrop — sits to the right of the sidebar only */}
      <div
        className="fixed top-0 bottom-0 right-0 z-40 bg-black/10 mt-0"
        style={{ ...sidebarOffset, marginTop: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="fixed top-0 bottom-0 right-0 z-50 bg-white shadow-2xl flex flex-col overflow-hidden mt-0"
        style={{ ...sidebarOffset, marginTop: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {children}
      </div>
    </>
  );
}

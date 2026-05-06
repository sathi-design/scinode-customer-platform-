"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerBaseProps {
  open: boolean;
  onClose: () => void;
  title: string;
  width?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function DrawerBase({
  open,
  onClose,
  title,
  width = 520,
  children,
  footer,
}: DrawerBaseProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/30 z-40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full bg-white z-50 flex flex-col shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          "w-full md:max-w-[var(--drawer-width)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
        style={{ "--drawer-width": `${width}px` } as React.CSSProperties}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#e4e4e7] flex-shrink-0 bg-white">
          <h3 className="text-base font-semibold text-[#020202]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#71717a] hover:text-[#020202] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 border-t border-[#e4e4e7] px-4 sm:px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}

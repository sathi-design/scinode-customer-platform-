"use client";

import { Monitor, Smartphone } from "lucide-react";
import { usePreviewMode } from "@/hooks/usePreviewMode";
import { cn } from "@/lib/utils";

export function PreviewToggle() {
  const { previewMode, switchTo } = usePreviewMode();

  return (
    <div className="flex items-center gap-0.5 bg-bg-subtle rounded-lg p-1 border border-[#B3B7BD]/30">
      <button
        onClick={() => switchTo("web")}
        title="Web View"
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors",
          previewMode === "web"
            ? "bg-white text-text-primary shadow-sm"
            : "text-text-muted hover:text-text-body"
        )}
      >
        <Monitor className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Web</span>
      </button>
      <button
        onClick={() => switchTo("mobile")}
        title="Mobile View"
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors",
          previewMode === "mobile"
            ? "bg-white text-text-primary shadow-sm"
            : "text-text-muted hover:text-text-body"
        )}
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Mobile</span>
      </button>
    </div>
  );
}

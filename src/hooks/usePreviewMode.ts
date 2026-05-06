"use client";

import { useAppStore } from "@/store/useAppStore";
import type { PreviewMode } from "@/types";

export function usePreviewMode() {
  const previewMode = useAppStore((s) => s.previewMode);
  const setPreviewMode = useAppStore((s) => s.setPreviewMode);

  const isMobile = previewMode === "mobile";
  const isWeb = previewMode === "web";

  const toggle = () =>
    setPreviewMode(previewMode === "web" ? "mobile" : "web");

  const switchTo = (mode: PreviewMode) => setPreviewMode(mode);

  return { previewMode, isMobile, isWeb, toggle, switchTo };
}

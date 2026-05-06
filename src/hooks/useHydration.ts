"use client";

import { useEffect, useState } from "react";

/**
 * Returns true once the client has hydrated.
 * Use this to prevent SSR/hydration mismatches with Zustand persist.
 */
export function useHydration(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}

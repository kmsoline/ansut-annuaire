"use client";

import { useState, useEffect } from "react";
import type { ViewMode } from "@/app/components/admin/ViewModeToggle";

export function useViewMode(
  key: string,
  defaultMode: ViewMode = "list"
): [ViewMode, (m: ViewMode) => void] {
  const storageKey = `admin-view-mode-${key}`;

  const [mode, setMode] = useState<ViewMode>(defaultMode);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey) as ViewMode | null;
      if (stored && ["list", "cards", "kanban"].includes(stored)) {
        setMode(stored);
      }
    }
  }, [storageKey]);

  const setModeAndPersist = (m: ViewMode) => {
    setMode(m);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, m);
    }
  };

  return [mode, setModeAndPersist];
}

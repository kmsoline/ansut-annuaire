"use client";

import { List, LayoutGrid, Columns3 } from "lucide-react";

export type ViewMode = "list" | "cards" | "kanban";

interface Props {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  hasKanban?: boolean;
}

export default function ViewModeToggle({ mode, onChange, hasKanban = false }: Props) {
  const buttons: { key: ViewMode; icon: React.ReactNode; label: string }[] = [
    { key: "list", icon: <List size={16} />, label: "Liste compacte" },
    { key: "cards", icon: <LayoutGrid size={16} />, label: "Cartes" },
    ...(hasKanban ? [{ key: "kanban" as ViewMode, icon: <Columns3 size={16} />, label: "Kanban" }] : []),
  ];

  return (
    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
      {buttons.map(({ key, icon, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          title={label}
          aria-label={label}
          className={`p-2 rounded-md transition-all duration-150 ${
            mode === key
              ? "bg-[var(--royal-blue)] text-white shadow-sm"
              : "text-[color-mix(in_oklch,var(--foreground)_65%,transparent)] hover:bg-white/10 hover:text-[var(--foreground)]"
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

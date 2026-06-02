"use client";

import type { SettingsSection as Section } from "@/lib/settings/types";

const sections: { id: Section; label: string }[] = [
  { id: "order", label: "Order" },
  { id: "vendor", label: "Vendor" },
  { id: "workflow", label: "Workflow" },
  { id: "business", label: "Business" },
  { id: "appearance", label: "Appearance" },
];

export function SettingsNav() {
  return (
    <nav className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}

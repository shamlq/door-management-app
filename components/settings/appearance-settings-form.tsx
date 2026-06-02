"use client";

import { useActionState } from "react";
import { updateAppearanceSettings } from "@/lib/actions/settings";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ErpSettings } from "@/lib/settings/types";
import {
  FormMessage,
  SettingsSection,
  inputClassName,
  labelClassName,
} from "./settings-section";

const ACCENT_PRESETS = [
  { name: "Amber", value: "#f59e0b" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Emerald", value: "#10b981" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Slate", value: "#475569" },
];

const initialState = { success: false, error: "" };

export function AppearanceSettingsForm({ settings }: { settings: ErpSettings }) {
  const [state, formAction] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await updateAppearanceSettings(formData);
      if (result.success) {
        const dark = formData.get("dark_mode") === "on";
        const accent = formData.get("accent_color")?.toString() || "#f59e0b";
        document.documentElement.classList.toggle("dark", dark);
        document.documentElement.style.setProperty("--accent", accent);
        window.location.reload();
      }
      return result.success
        ? { success: true, error: "" }
        : { success: false, error: result.error ?? "Save failed" };
    },
    initialState
  );

  return (
    <SettingsSection
      title="Appearance Settings"
      description="Dark mode and accent color for the dashboard"
    >
      <form action={formAction} className="space-y-4">
        <label className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
          <div>
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Dark mode
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Use dark theme across the app
            </p>
          </div>
          <input
            type="checkbox"
            name="dark_mode"
            defaultChecked={settings.dark_mode}
            className="h-5 w-5 rounded border-slate-300 text-[var(--accent)] focus:ring-[var(--accent)]"
          />
        </label>

        <div>
          <span className={labelClassName}>Accent color</span>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <input
              type="color"
              name="accent_color"
              defaultValue={settings.accent_color}
              className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 dark:border-slate-600"
            />
            <div className="flex flex-wrap gap-2">
              {ACCENT_PRESETS.map((preset) => (
                <label
                  key={preset.value}
                  className="cursor-pointer"
                  title={preset.name}
                >
                  <input
                    type="radio"
                    name="accent_preset"
                    value={preset.value}
                    defaultChecked={settings.accent_color === preset.value}
                    className="peer sr-only"
                    onChange={(e) => {
                      const colorInput = document.querySelector(
                        'input[name="accent_color"]'
                      ) as HTMLInputElement;
                      if (colorInput) colorInput.value = e.target.value;
                    }}
                  />
                  <span
                    className="block h-8 w-8 rounded-full ring-2 ring-transparent peer-checked:ring-slate-900 dark:peer-checked:ring-white"
                    style={{ backgroundColor: preset.value }}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div
          className="rounded-xl p-4 text-white text-sm"
          style={{ backgroundColor: settings.accent_color }}
        >
          Accent preview — buttons and highlights use this color
        </div>

        <FormMessage error={state.error} success={state.success} />
        <SubmitButton label="Save Appearance" />
      </form>
    </SettingsSection>
  );
}

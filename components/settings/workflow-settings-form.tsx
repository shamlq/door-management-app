"use client";

import { useActionState } from "react";
import { updateWorkflowSettings } from "@/lib/actions/settings";
import { SubmitButton } from "@/components/ui/submit-button";
import { ORDER_ITEM_STATUSES } from "@/lib/status-config";
import type { ErpSettings } from "@/lib/settings/types";
import {
  FormMessage,
  SettingsSection,
  inputClassName,
  labelClassName,
} from "./settings-section";

const initialState = { success: false, error: "" };

export function WorkflowSettingsForm({ settings }: { settings: ErpSettings }) {
  const [state, formAction] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await updateWorkflowSettings(formData);
      return result.success
        ? { success: true, error: "" }
        : { success: false, error: result.error ?? "Save failed" };
    },
    initialState
  );

  const stageMap = new Map(settings.order_stages.map((s) => [s.key, s]));

  return (
    <SettingsSection
      title="Workflow Settings"
      description="Customize order stage labels and status colors"
    >
      <form action={formAction} className="space-y-4">
        <ul className="space-y-3">
          {ORDER_ITEM_STATUSES.map((key) => {
            const stage = stageMap.get(key);
            const color = settings.status_colors[key] ?? "#64748b";
            return (
              <li
                key={key}
                className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:grid-cols-[1fr_1fr_auto] dark:border-slate-700 dark:bg-slate-800/50"
              >
                <div>
                  <span className={labelClassName}>Stage key</span>
                  <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                    {key}
                  </p>
                </div>
                <label className="block">
                  <span className={labelClassName}>Display label</span>
                  <input
                    name={`stage_label_${key}`}
                    defaultValue={stage?.label ?? key}
                    className={inputClassName}
                  />
                </label>
                <label className="block">
                  <span className={labelClassName}>Color</span>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      name={`stage_color_${key}`}
                      defaultValue={color}
                      className="h-9 w-12 cursor-pointer rounded border border-slate-200 dark:border-slate-600"
                    />
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: color }}
                    >
                      Preview
                    </span>
                  </div>
                </label>
              </li>
            );
          })}
        </ul>
        <FormMessage error={state.error} success={state.success} />
        <SubmitButton label="Save Workflow Settings" />
      </form>
    </SettingsSection>
  );
}

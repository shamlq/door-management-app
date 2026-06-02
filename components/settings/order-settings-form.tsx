"use client";

import { useActionState } from "react";
import { updateOrderSettings } from "@/lib/actions/settings";
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

export function OrderSettingsForm({ settings }: { settings: ErpSettings }) {
  const [state, formAction] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await updateOrderSettings(formData);
      return result.success
        ? { success: true, error: "" }
        : { success: false, error: result.error ?? "Save failed" };
    },
    initialState
  );

  return (
    <SettingsSection
      title="Order Settings"
      description="Defaults for new orders, numbering, and payment terms"
    >
      <form action={formAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelClassName}>Order number prefix</span>
            <input
              name="order_number_prefix"
              defaultValue={settings.order_number_prefix}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <span className={labelClassName}>Order number format</span>
            <input
              name="order_number_format"
              defaultValue={settings.order_number_format}
              placeholder="{PREFIX}-{YEAR}-{SEQ}"
              className={inputClassName}
            />
            <span className="mt-1 block text-[10px] text-slate-400">
              Tokens: {"{PREFIX}"}, {"{YEAR}"}, {"{SEQ}"}
            </span>
          </label>
          <label className="block">
            <span className={labelClassName}>Default item status</span>
            <select
              name="default_item_status"
              defaultValue={settings.default_item_status}
              className={inputClassName}
            >
              {ORDER_ITEM_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClassName}>Default payment status</span>
            <select
              name="default_payment_status"
              defaultValue={settings.default_payment_status}
              className={inputClassName}
            >
              {(["Pending", "Partial", "Paid", "Overdue"] as const).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClassName}>Measurement unit</span>
            <select
              name="measurement_unit"
              defaultValue={settings.measurement_unit}
              className={inputClassName}
            >
              <option value="mm">Millimeters (mm)</option>
              <option value="cm">Centimeters (cm)</option>
              <option value="inch">Inches (inch)</option>
              <option value="ft">Feet (ft)</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className={labelClassName}>Payment terms</span>
            <textarea
              name="payment_terms"
              rows={2}
              defaultValue={settings.payment_terms}
              className={inputClassName}
            />
          </label>
        </div>
        <FormMessage error={state.error} success={state.success} />
        <SubmitButton label="Save Order Settings" />
      </form>
    </SettingsSection>
  );
}

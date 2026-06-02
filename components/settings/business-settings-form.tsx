"use client";

import { useActionState } from "react";
import { updateBusinessSettings } from "@/lib/actions/settings";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ErpSettings } from "@/lib/settings/types";
import {
  FormMessage,
  SettingsSection,
  inputClassName,
  labelClassName,
} from "./settings-section";

const initialState = { success: false, error: "" };

export function BusinessSettingsForm({ settings }: { settings: ErpSettings }) {
  const [state, formAction] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await updateBusinessSettings(formData);
      return result.success
        ? { success: true, error: "" }
        : { success: false, error: result.error ?? "Save failed" };
    },
    initialState
  );

  return (
    <SettingsSection
      title="Business Settings"
      description="Company details shown on documents and dashboard"
    >
      <form action={formAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={labelClassName}>Company name *</span>
            <input
              name="company_name"
              required
              defaultValue={settings.company_name}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <span className={labelClassName}>Phone</span>
            <input
              name="company_phone"
              defaultValue={settings.company_phone ?? ""}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <span className={labelClassName}>GST number</span>
            <input
              name="gst_number"
              defaultValue={settings.gst_number ?? ""}
              placeholder="22AAAAA0000A1Z5"
              className={inputClassName}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelClassName}>Address</span>
            <textarea
              name="company_address"
              rows={3}
              defaultValue={settings.company_address ?? ""}
              className={inputClassName}
            />
          </label>
        </div>
        <FormMessage error={state.error} success={state.success} />
        <SubmitButton label="Save Business Settings" />
      </form>
    </SettingsSection>
  );
}

"use client";

import { useActionState } from "react";
import { updateVendorSettings } from "@/lib/actions/settings";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ErpSettings } from "@/lib/settings/types";
import {
  FormMessage,
  SettingsSection,
  inputClassName,
  labelClassName,
} from "./settings-section";

const initialState = { success: false, error: "" };

export function VendorSettingsForm({ settings }: { settings: ErpSettings }) {
  const [state, formAction] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await updateVendorSettings(formData);
      return result.success
        ? { success: true, error: "" }
        : { success: false, error: result.error ?? "Save failed" };
    },
    initialState
  );

  return (
    <SettingsSection
      title="Vendor Settings"
      description="Categories and door types for vendor assignment"
    >
      <form action={formAction} className="space-y-4">
        <label className="block">
          <span className={labelClassName}>Vendor categories (one per line)</span>
          <textarea
            name="vendor_categories"
            rows={5}
            defaultValue={settings.vendor_categories.join("\n")}
            className={inputClassName}
          />
        </label>
        <label className="block">
          <span className={labelClassName}>Supported door types (one per line)</span>
          <textarea
            name="supported_door_types"
            rows={6}
            defaultValue={settings.supported_door_types.join("\n")}
            className={inputClassName}
          />
        </label>
        <FormMessage error={state.error} success={state.success} />
        <SubmitButton label="Save Vendor Settings" />
      </form>
    </SettingsSection>
  );
}

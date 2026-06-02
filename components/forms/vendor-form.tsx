"use client";

import { useActionState } from "react";
import { createVendor } from "@/lib/actions/vendors";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState = { success: false, error: "" };

export function VendorForm() {
  const [state, formAction] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createVendor(formData);
      if (result.success) {
        (document.getElementById("vendor-form") as HTMLFormElement)?.reset();
        return { success: true, error: "" };
      }
      return { success: false, error: result.error ?? "Failed to create vendor" };
    },
    initialState
  );

  return (
    <form
      id="vendor-form"
      action={formAction}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h3 className="text-sm font-semibold text-slate-900">Add Vendor</h3>
      <label className="block">
        <span className="text-xs font-medium text-slate-600">Name *</span>
        <input
          name="name"
          required
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Contact person</span>
          <input
            name="contact_person"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Phone</span>
          <input
            name="phone"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-medium text-slate-600">Email</span>
        <input
          name="email"
          type="email"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
        />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-emerald-600">Vendor created successfully.</p>
      )}
      <SubmitButton label="Create Vendor" />
    </form>
  );
}

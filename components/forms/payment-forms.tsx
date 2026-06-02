"use client";

import { useActionState, useTransition, useState } from "react";
import { createPayment, updateOrderPayment } from "@/lib/actions/payments";
import { SubmitButton } from "@/components/ui/submit-button";
import type { PaymentStatus } from "@/lib/supabase/database.types";
import type { Order } from "@/lib/types";

const PAYMENT_STATUSES: PaymentStatus[] = [
  "Paid",
  "Partial",
  "Pending",
  "Overdue",
];

export function RecordPaymentForm({ orderId }: { orderId: string }) {
  const [state, formAction] = useActionState(
    async (_prev: { error: string; success: boolean }, formData: FormData) => {
      formData.set("order_id", orderId);
      const result = await createPayment(formData);
      if (result.success) {
        (document.getElementById("payment-form") as HTMLFormElement)?.reset();
        return { success: true, error: "" };
      }
      return { success: false, error: result.error ?? "Failed to record payment" };
      },
      { success: false, error: "" }
    );

    return (
      <form
        id="payment-form"
        action={formAction}
        className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4"
      >
        <h4 className="text-sm font-semibold text-slate-900">Record Payment</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Amount (₹) *</span>
            <input
              name="amount"
            type="number"
            min={1}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Date</span>
          <input
            name="payment_date"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium text-slate-600">Method</span>
          <input
            name="method"
            placeholder="Bank Transfer, UPI, Cash..."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
          />
        </label>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-emerald-600">Payment recorded.</p>
      )}
      <SubmitButton label="Record Payment" className="w-full sm:w-auto" />
    </form>
  );
}

export function UpdatePaymentStatusForm({ order }: { order: Order }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateOrderPayment(order.id, formData);
      setMessage(
        result.success
          ? { type: "success", text: "Payment info updated." }
          : { type: "error", text: result.error ?? "Update failed" }
      );
    });
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4"
    >
      <h4 className="text-sm font-semibold text-slate-900">Update Payment Status</h4>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Status</span>
          <select
            name="payment_status"
            defaultValue={order.paymentStatus}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
          >
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Paid amount (₹)</span>
          <input
            name="paid_amount"
            type="number"
            min={0}
            defaultValue={order.paidAmount}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
          />
        </label>
      </div>
      <p className="text-xs text-slate-500">
        Order total: ₹{order.totalAmount.toLocaleString("en-IN")} · Balance: ₹
        {(order.totalAmount - order.paidAmount).toLocaleString("en-IN")}
      </p>
      {message && (
        <p
          className={`text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}
        >
          {message.text}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {isPending ? "Updating..." : "Update Payment Info"}
      </button>
    </form>
  );
}

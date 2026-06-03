"use client";

import { useActionState, useTransition, useState } from "react";
import { createPayment, updateOrderPayment } from "@/lib/actions/payments";
import { SubmitButton } from "@/components/ui/submit-button";
import type { PaymentStatus } from "@/lib/supabase/database.types";
import type { Order } from "@/lib/types";
import type { DbPayment } from "@/lib/supabase/database.types";

const PAYMENT_STATUSES: PaymentStatus[] = [
  "Paid",
  "Partial",
  "Pending",
  "Overdue",
];

export function RecordPaymentForm(
  {
    orderId,
    order,
    payments,
  }: {
    orderId: string;
    order: Order;
    payments: DbPayment[];
  }
) {
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

    const [fullPayment, setFullPayment] = useState(false);

const discountAmount = payments.reduce(
  (sum, p) => sum + Number(p.discount_amount ?? 0),
  0
);

const balanceAmount =
  order.totalAmount -
  order.paidAmount -
  discountAmount;

    return (
      <form
        id="payment-form"
        action={formAction}
        className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4"
      >
        <h4 className="text-sm font-semibold text-slate-900">Record Payment</h4>
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
  Balance Due: ₹{balanceAmount.toLocaleString("en-IN")}
</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Amount (₹) *</span>
            <input
  name="amount"
  type="number"
  min={1}
  required
  defaultValue={
  fullPayment
    ? order.totalAmount - order.paidAmount
    : undefined
}
readOnly={fullPayment}
  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
/>
          <label className="mt-2 flex items-center gap-2 text-sm">
  <input
    type="checkbox"
    checked={fullPayment}
    onChange={(e) => setFullPayment(e.target.checked)}
  />
  Received Full Amount
</label>
  
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
        <label className="block">
  <span className="text-xs font-medium text-slate-600">
    Discount (₹)
  </span>
  <input
    name="discount_amount"
    type="number"
    min={0}
    defaultValue={0}
    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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


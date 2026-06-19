"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { AddOrderItemPanel } from "@/components/orders/add-order-item-panel";
import { EditOrderItemModal } from "@/components/orders/edit-order-item-modal";
import {
  RecordPaymentForm,
  
} from "@/components/forms/payment-forms";
import { formatCurrency } from "@/lib/status-config";
import {
  deletePayment,
  updatePayment,
} from "@/lib/actions/payments";
import { generateReceiptPdf }
  from "@/lib/actions/pdf-receipts";
import type { Database } from "@/lib/supabase/database.types";
import type { Order, OrderItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { updateOrder } from "@/lib/actions/orders";


type Vendor = Database["public"]["Tables"]["vendors"]["Row"];

type DbPayment = Database["public"]["Tables"]["payments"]["Row"];

type OrderItemStatus =
  Database["public"]["Enums"]["order_item_status"];

type OrderDetailClientProps = {
  order: Order;
  vendors: Vendor[];
  payments: DbPayment[];
  defaultItemStatus: OrderItemStatus;
};

function formatDims(item: OrderItem) {
  const parts = [
    item.width != null ? `W ${item.width}` : null,
    item.height != null ? `H ${item.height}` : null,
    item.depth != null ? `D ${item.depth}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" × ") : "—";
}

export function OrderDetailClient({
  order,
  vendors,
  payments,
  defaultItemStatus,
}: OrderDetailClientProps) {
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);

  const [editingOrder, setEditingOrder] = useState(false);
const [isPending, startTransition] = useTransition();

const [projectName, setProjectName] =
  useState(order.project);

const [deliveryDate, setDeliveryDate] =
  useState(order.expectedDeliveryDate || "");

const [notes, setNotes] =
  useState(order.notes || "");

const [measurementRequired, setMeasurementRequired] =
  useState(order.measurementRequired ?? false);

const [installationRequired, setInstallationRequired] =
  useState(order.installationRequired ?? false);

  const workflowStatus = order.workflowStatus;
  
  async function handleSaveOrder() {
  const formData = new FormData();

  formData.set("project_name", projectName);
  formData.set("expected_delivery_date", deliveryDate);
  formData.set("notes", notes);
  formData.set(
    "measurement_required",
    String(measurementRequired)
  );
  formData.set(
    "installation_required",
    String(installationRequired)
  );

  startTransition(async () => {
    const result = await updateOrder(order.id, formData);

    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error ?? "Failed to update order");
    }
  });
}
  
const [editingPayment, setEditingPayment] =
  useState<string | null>(null);

  const [editedAmount, setEditedAmount] =
  useState("");

const [editedMethod, setEditedMethod] =
  useState("");

const [editedDate, setEditedDate] =
  useState("");

const totalPayments = payments.reduce(
  (sum, p) => sum + Number(p.amount ?? 0),
  0
);

const totalDiscounts = payments.reduce(
  (sum, p) => sum + Number(p.discount_amount ?? 0),
  0
);

const balanceDue =
  order.totalAmount -
  totalPayments -
  totalDiscounts;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/orders" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-200">
          ← Back to Orders
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
  <div className="flex items-center gap-3">
    <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
      {order.orderNumber}
    </h1>

    <div className="flex gap-2">
  {editingOrder && (
    <button
      type="button"
      onClick={handleSaveOrder}
      disabled={isPending}
      className="rounded bg-green-600 px-2 py-1 text-xs text-white"
    >
      {isPending ? "Saving..." : "Save"}
    </button>
  )}

  <button
    type="button"
    onClick={() => setEditingOrder(!editingOrder)}
    className="rounded border px-2 py-1 text-xs hover:bg-slate-50"
  >
    {editingOrder ? "Cancel" : "Edit Order"}
  </button>
</div>
  </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
  {order.customer}
</p>

<div className="mt-3 inline-flex items-center rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
  Workflow: {workflowStatus}
</div>

{editingOrder ? (
  <input
    type="text"
    value={projectName}
    onChange={(e) => setProjectName(e.target.value)}
    className="mt-1 w-full max-w-md rounded border px-3 py-2 text-sm"
  />
) : (
  <p className="text-sm text-slate-500">
    {order.project}
  </p>
)}


{editingOrder ? (
  <input
    type="date"
    value={deliveryDate}
    onChange={(e) => setDeliveryDate(e.target.value)}
    className="mt-1 rounded border px-3 py-2 text-sm"
  />
) : (
  order.expectedDeliveryDate && (
    <p className="mt-1 text-sm text-slate-600">
      📅 Delivery: {formatDate(order.expectedDeliveryDate)}
    </p>
  )
)}

{editingOrder ? (
  <textarea
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    rows={3}
    className="mt-1 w-full max-w-md rounded border px-3 py-2 text-sm"
  />
) : (
  order.notes && (
    <p className="mt-1 text-sm text-slate-600">
      📝 {order.notes}
    </p>
  )
)}

{editingOrder ? (
  <label className="mt-1 block text-sm">
    <input
      type="checkbox"
      checked={measurementRequired}
      onChange={(e) => setMeasurementRequired(e.target.checked)}
      className="mr-2"
    />
    Measurement Required
  </label>
) : (
  <p className="mt-1 text-sm text-slate-600">
    📏 Measurement: {order.measurementRequired ? "Yes" : "No"}
  </p>
)}

{editingOrder ? (
  <label className="mt-1 block text-sm">
    <input
      type="checkbox"
      checked={installationRequired}
      onChange={(e) => setInstallationRequired(e.target.checked)}
      className="mr-2"
    />
    Installation Required
  </label>
) : (
  <p className="mt-1 text-sm text-slate-600">
    🔧 Installation: {order.installationRequired ? "Yes" : "No"}
  </p>
)}

<p className="text-xs text-slate-400 mt-2">
  Created {formatDate(order.createdAt)}
</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(order.totalAmount)}
            </p>
            <p className="text-sm text-slate-500">
              Paid: {formatCurrency(order.paidAmount)}
            </p>
            <div className="mt-2 flex justify-end">
              <StatusBadge status={order.paymentStatus} variant="payment" size="md" />
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Order Items ({order.items.length})
            </h2>
            <p className="text-xs text-slate-500">Click Edit to update vendor, status, dimensions & pricing</p>
          </div>
        </div>

        {order.items.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">No items yet. Add products below.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50">
                  <th className="px-5 py-3 font-semibold text-slate-600">Product</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">Vendor</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">Status</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">Qty</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">Dimensions</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">Amount</th>
                  <th className="px-5 py-3 font-semibold text-slate-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {order.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
                      {item.productCategory && (
                        <p className="text-xs text-slate-500">{item.productCategory}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                      {item.vendor ?? (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="px-5 py-3">{item.quantity}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{formatDims(item)}</td>
                    <td className="px-5 py-3 font-semibold">{formatCurrency(item.amount)}</td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => setEditingItem(item)}
                        className="text-xs font-medium text-[var(--accent)] hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <AddOrderItemPanel
          orderId={order.id}
          vendors={vendors}
          defaultStatus={defaultItemStatus}
        />
        <div className="space-y-4">
          <RecordPaymentForm
  orderId={order.id}
  order={order}
  payments={payments}
/>
          
          {payments.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
  Payment History
</h3>

<div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
  <div className="flex justify-between text-sm">
    <span>Total Payments</span>
    <span>{formatCurrency(totalPayments)}</span>
  </div>

  <div className="mt-1 flex justify-between text-sm">
    <span>Total Discounts</span>
    <span>{formatCurrency(totalDiscounts)}</span>
  </div>

  <div className="mt-2 flex justify-between text-sm font-semibold text-red-700">
    <span>Balance Due</span>
    <span>{formatCurrency(balanceDue)}</span>
  </div>
</div>

<div className="overflow-x-auto">
  <table className="min-w-full text-sm">
    <thead>
      <tr className="border-b border-slate-200">
        <th className="py-2 text-left">Receipt No</th>
        <th className="py-2 text-left">Date</th>
<th className="py-2 text-left">Method</th>
<th className="py-2 text-right">Amount</th>
<th className="py-2 text-right">Discount</th>
<th className="py-2 text-center">Actions</th>
      </tr>
    </thead>
    <tbody>
      {payments.map((p) => (
        <tr
  key={p.id}
  className="border-b border-slate-100"
>

<td className="py-2 font-medium">
  {p.receipt_no ?? "-"}
</td>

<td className="py-2">
  {editingPayment === p.id ? (
    <input
      type="date"
      value={editedDate}
      onChange={(e) => setEditedDate(e.target.value)}
      className="w-full rounded border px-2 py-1 text-sm"
    />
  ) : (
  formatDate(p.payment_date)
)}
</td>

          <td className="py-2">
  {editingPayment === p.id ? (
    <input
      type="text"
      value={editedMethod}
      onChange={(e) => setEditedMethod(e.target.value)}
      className="w-full rounded border px-2 py-1 text-sm"
    />
  ) : (
    p.method || "-"
  )}
</td>

          <td className="py-2 text-right font-medium">
  {editingPayment === p.id ? (
    <input
      type="number"
      min="1"
      value={editedAmount}
      onChange={(e) => setEditedAmount(e.target.value)}
      className="w-28 rounded border px-2 py-1 text-sm text-right"
    />
  ) : (
    formatCurrency(Number(p.amount))
  )}
</td>
<td className="py-2 text-right">
  {formatCurrency(Number(p.discount_amount ?? 0))}
</td>

<td className="py-2 text-center">
  {editingPayment === p.id ? (
  <>
    <button
      type="button"
      onClick={async () => {
  const formData = new FormData();

  formData.append("amount", editedAmount);
  formData.append("payment_date", editedDate);
  formData.append("method", editedMethod);

  const result = await updatePayment(
    p.id,
    formData
  );

  if (result.success) {
    setEditingPayment(null);
    window.location.reload();
  } else {
    alert(result.error ?? "Failed to update payment");
  }
}}
      className="mr-3 text-emerald-600 hover:text-emerald-700"
    >
      Save
    </button>

    <button
      type="button"
      onClick={() => setEditingPayment(null)}
      className="text-slate-600 hover:text-slate-700"
    >
      Cancel
    </button>
  </>
) : (
  <>
    <button
      type="button"
      onClick={() => {
  setEditingPayment(p.id);
  setEditedAmount(String(p.amount));
  setEditedMethod(p.method || "");
  setEditedDate(p.payment_date);
}}
      className="mr-3 text-blue-600 hover:text-blue-700"
    >
      Edit
    </button>

    <button
      type="button"
      onClick={async () => {
        if (!confirm("Delete this payment?")) return;

        await deletePayment(p.id, order.id);
        window.location.reload();
      }}
      className="text-red-600 hover:text-red-700"
    >
      Delete
    </button>

    <button
  type="button"
  onClick={async () => {
    

    try {
      const pdfBytes =
        await generateReceiptPdf(p.id);

      

      const blob = new Blob(
  [new Uint8Array(pdfBytes)],
  { type: "application/pdf" }
);

const url = URL.createObjectURL(blob);

const link = document.createElement("a");

link.href = url;

link.download =
  `${p.receipt_no ?? "receipt"}.pdf`;

document.body.appendChild(link);

link.click();

document.body.removeChild(link);

URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("PDF ERROR");
    }
  }}
  className="ml-3 text-green-600 hover:text-green-700"
>
  PDF
</button>
  </>
)}
</td>

</tr>
      ))}
    </tbody>
  </table>
</div>
            </section>
          )}
        </div>
      </div>

      <EditOrderItemModal
        item={editingItem}
        orderId={order.id}
        vendors={vendors}
        onClose={() => setEditingItem(null)}
      />
    </>
  );
}

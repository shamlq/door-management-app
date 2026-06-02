"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { AddOrderItemPanel } from "@/components/orders/add-order-item-panel";
import { EditOrderItemModal } from "@/components/orders/edit-order-item-modal";
import {
  RecordPaymentForm,
  
} from "@/components/forms/payment-forms";
import { formatCurrency } from "@/lib/status-config";
import type { Vendor } from "@/lib/supabase/database.types";
import type { DbPayment } from "@/lib/supabase/database.types";
import type { Order, OrderItem } from "@/lib/types";
import type { OrderItemStatus } from "@/lib/supabase/database.types";

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
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {order.orderNumber}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{order.customer}</p>
            <p className="text-sm text-slate-500">{order.project}</p>
            <p className="text-xs text-slate-400 mt-2">Created {order.createdAt}</p>
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
          <RecordPaymentForm orderId={order.id} />
          
          {payments.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Payment History
              </h3>
              <ul className="space-y-2">
                {payments.map((p) => (
                  <li
                    key={p.id}
                    className="flex justify-between text-sm border-b border-slate-50 pb-2 last:border-0 dark:border-slate-800"
                  >
                    <span className="text-slate-600 dark:text-slate-400">
                      {p.payment_date}
                      {p.method ? ` · ${p.method}` : ""}
                    </span>
                    <span className="font-medium">{formatCurrency(Number(p.amount))}</span>
                  </li>
                ))}
              </ul>
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

import Link from "next/link";
import { formatCurrency } from "@/lib/status-config";
import type { Order } from "@/lib/types";
import { StatusBadge } from "./status-badge";
import { formatDate } from "@/lib/utils";

type RecentOrdersTableProps = {
  orders: Order[];
};

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Recent Orders
          </h2>
          <p className="text-sm text-slate-500">
            Multi-item orders with per-item vendor & status
          </p>
        </div>
        <Link
        
          href="/orders"
          className="self-start rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors sm:self-auto"
        >
          View All Orders
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-slate-500">
          No orders yet.{" "}
          <Link href="/orders" className="font-medium text-slate-900 underline">
            Create your first order
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-5 py-3 font-semibold text-slate-600 sm:px-6">
                  Order
                </th>
                <th className="px-5 py-3 font-semibold text-slate-600 sm:px-6">
                  Customer / Project
                </th>
                <th className="px-5 py-3 font-semibold text-slate-600 sm:px-6">
                  Items & Status
                </th>
                <th className="px-5 py-3 font-semibold text-slate-600 sm:px-6">
                  Amount
                </th>
                <th className="px-5 py-3 font-semibold text-slate-600 sm:px-6">
                  Payment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-5 py-4 align-top sm:px-6">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-semibold text-slate-900 hover:text-amber-700"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {formatDate(order.createdAt)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </p>
                  </td>
                  <td className="px-5 py-4 align-top sm:px-6">
                    <p className="font-medium text-slate-900">{order.customer}</p>
                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                      {order.project}
                    </p>
                  </td>
                  <td className="px-5 py-4 align-top sm:px-6">
                    <ul className="space-y-2.5">
                      {order.items.map((item) => (
                        <li
                          key={item.id}
                          className="rounded-lg bg-slate-50/80 px-3 py-2 ring-1 ring-slate-100"
                        >
                          <p className="text-xs font-medium text-slate-800 line-clamp-1">
                            {item.name}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <StatusBadge status={item.status} size="sm" />
                            <span className="text-[10px] text-slate-400">
                              {item.vendor ?? "No vendor"}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-5 py-4 align-top sm:px-6 whitespace-nowrap">
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Paid: {formatCurrency(order.paidAmount)}
                    </p>
                  </td>
                  <td className="px-5 py-4 align-top sm:px-6">
                    <StatusBadge
                      status={order.paymentStatus}
                      variant="payment"
                      size="md"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

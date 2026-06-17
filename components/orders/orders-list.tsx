"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatCurrency } from "@/lib/status-config";
import type { Order } from "@/lib/types";

type Props = {
  orders: Order[];
};

export function OrdersList({ orders }: Props) {
  const [search, setSearch] = useState("");

  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return orders;

    return orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(q) ||
        order.customer.toLowerCase().includes(q) ||
        order.project.toLowerCase().includes(q)
    );
  }, [orders, search]);

  return (
    <>
      <div className="border-b border-slate-100 px-5 py-4">
        <input
          type="search"
          placeholder="Search order no, customer or project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      {filteredOrders.length === 0 ? (
        <p className="px-5 py-8 text-sm text-slate-500">
          No matching orders found.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {filteredOrders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="block px-5 py-4 hover:bg-slate-50"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {order.orderNumber}
                    </p>

                    <p className="text-sm text-slate-600">
                      {order.customer}
                    </p>

                    <p className="text-xs text-slate-500">
                      {order.project}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(order.totalAmount)}
                    </p>

                    <StatusBadge
                      status={order.paymentStatus}
                      variant="payment"
                      size="sm"
                    />
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  {order.items.length} product
                  {order.items.length !== 1 ? "s" : ""}
                  {" · "}
                  {order.createdAt}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
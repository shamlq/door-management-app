import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { CreateOrderForm } from "@/components/orders/create-order-form";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SupabaseBanner } from "@/components/ui/supabase-banner";
import { getAllOrders, getCustomers, getVendors } from "@/lib/data/queries";
import { formatCurrency } from "@/lib/status-config";
import { canQueryDatabase } from "@/lib/data/safe-query";
import { redirect } from "next/navigation";
import { getUserPermissions } from "@/lib/data/queries";

export default async function OrdersPage() {
  const permissions = await getUserPermissions();

if (!permissions.includes("orders.view")) {
  redirect("/");
}
  const ready = await canQueryDatabase();
  const [orders, customers, vendors] = ready
    ? await Promise.all([getAllOrders(), getCustomers(), getVendors()])
    : [[], [], []];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <SupabaseBanner />
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Orders</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create orders with multiple products; assign vendors later if needed
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <CreateOrderForm customers={customers} vendors={vendors} />
          </div>

          <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                All Orders ({orders.length})
              </h2>
            </div>
            {orders.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500">No orders yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={`/orders/${order.id}`}
                      className="block px-5 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{order.customer}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{order.project}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
                          <StatusBadge status={order.paymentStatus} variant="payment" size="sm" />
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        {order.items.length} product{order.items.length !== 1 ? "s" : ""} · {order.createdAt}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

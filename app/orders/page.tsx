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
import { OrdersList } from "@/components/orders/orders-list";

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
        <div className="flex items-start justify-between">
  <div>
    <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
      Orders
    </h1>
    <p className="text-sm text-slate-500 dark:text-slate-400">
      Manage customer orders
    </p>
  </div>

  <Link
    href="/orders/new"
    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
  >
    + New Order
  </Link>
</div>

        <div>

  

  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                All Orders ({orders.length})
              </h2>
            </div>
            {orders.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500">No orders yet.</p>
            ) : (
              <OrdersList orders={orders} />
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

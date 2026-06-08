import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PaymentSummary } from "@/components/dashboard/payment-summary";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SupabaseBanner } from "@/components/ui/supabase-banner";
import { getAllOrders, getPaymentSummary } from "@/lib/data/queries";
import { formatCurrency } from "@/lib/status-config";
import { canQueryDatabase } from "@/lib/data/safe-query";
import { redirect } from "next/navigation";
import { getUserPermissions } from "@/lib/data/queries";

export default async function PaymentsPage() {
  const permissions = await getUserPermissions();

  if (!permissions.includes("payments.view")) {
    redirect("/");
  }

  const ready = await canQueryDatabase();
  const [summary, orders] = ready
    ? await Promise.all([getPaymentSummary(), getAllOrders()])
    : [
        {
          totalRevenue: 0,
          collected: 0,
          pending: 0,
          overdue: 0,
          partialPayments: 0,
        },
        [],
      ];

  const pendingOrders = orders.filter((o) => o.paymentStatus !== "Paid");

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <SupabaseBanner />
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Payments</h1>
          <p className="text-sm text-slate-500">
            Record payments on order detail pages; summary below
          </p>
        </div>

        <PaymentSummary summary={summary} />

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Orders with balance ({pendingOrders.length})
            </h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {pendingOrders.length === 0 ? (
              <li className="px-5 py-8 text-sm text-slate-500">
                All orders fully paid.
              </li>
            ) : (
              pendingOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 hover:bg-slate-50/50"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-slate-500">{order.customer}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Due:{" "}
                          {formatCurrency(order.totalAmount - order.paidAmount)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(order.paidAmount)} /{" "}
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                      <StatusBadge
                        status={order.paymentStatus}
                        variant="payment"
                        size="sm"
                      />
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </DashboardLayout>
  );
}

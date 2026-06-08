import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StatCards } from "@/components/dashboard/stat-cards";
import { SupabaseBanner } from "@/components/ui/supabase-banner";
import { getDashboardStats, getPaymentSummary } from "@/lib/data/queries";
import { formatCurrency } from "@/lib/status-config";
import { canQueryDatabase } from "@/lib/data/safe-query";
import { redirect } from "next/navigation";
import { getUserPermissions } from "@/lib/data/queries";

export default async function ReportsPage() {
  const permissions = await getUserPermissions();

  if (!permissions.includes("reports.view")) {
    redirect("/");
  }

  const ready = await canQueryDatabase();
  const [stats, summary] = ready
    ? await Promise.all([getDashboardStats(), getPaymentSummary()])
    : [
        {
  totalOrders: 0,
  completedOrders: 0,
  ordersInProgress: 0,

  measurementPending: 0,
  vendorAssignmentPending: 0,
  inProduction: 0,
  receivedAtVLocks: 0,
  installationPending: 0,

  paymentPending: 0,

  totalOrderValue: 0,
  collectionsReceived: 0,
  outstandingAmount: 0,
},
        {
          totalRevenue: 0,
          collected: 0,
          pending: 0,
          overdue: 0,
          partialPayments: 0,
        },
      ];

  const collectionRate =
    summary.totalRevenue > 0
      ? Math.round((summary.collected / summary.totalRevenue) * 100)
      : 0;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <SupabaseBanner />
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">Live metrics from Supabase</p>
        </div>

        <StatCards stats={stats} />

        <div className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase">
              Collection rate
            </p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {collectionRate}%
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase">
              Total revenue
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {formatCurrency(summary.totalRevenue)}
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase">
              Outstanding
            </p>
            <p className="mt-1 text-2xl font-bold text-red-700">
              {formatCurrency(summary.pending)}
            </p>
          </article>
        </div>
      </div>
    </DashboardLayout>
  );
}

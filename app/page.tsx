import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PaymentSummary } from "@/components/dashboard/payment-summary";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { StatCards } from "@/components/dashboard/stat-cards";
import { WorkflowLegend } from "@/components/dashboard/workflow-legend";
import { SupabaseBanner } from "@/components/ui/supabase-banner";
import {
  getDashboardStats,
  getPaymentSummary,
  getRecentOrders,
} from "@/lib/data/queries";
import { canQueryDatabase } from "@/lib/data/safe-query";

const emptyStats = {
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
};

const emptySummary = {
  totalRevenue: 0,
  collected: 0,
  pending: 0,
  overdue: 0,
  partialPayments: 0,
};

export default async function DashboardPage() {
  const ready = await canQueryDatabase();

  const [stats, summary, orders] = ready
    ? await Promise.all([
        getDashboardStats(),
        getPaymentSummary(),
        getRecentOrders(8),
      ])
    : [emptyStats, emptySummary, []];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1600px] space-y-6 lg:space-y-8">
        <SupabaseBanner />

        <div className="sm:hidden">
          <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Door & hardware order overview</p>
        </div>

        <StatCards stats={stats} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-6">
            <WorkflowLegend />
            <RecentOrdersTable orders={orders} />
          </div>
          <div className="xl:col-span-1">
            <PaymentSummary summary={summary} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

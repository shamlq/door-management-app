import { formatCurrency } from "@/lib/status-config";
import type { DashboardStats } from "@/lib/types";

type StatCard = {
  label: string;
  value: string | number;
  sublabel?: string;
  accent: string;
  iconBg: string;
};

function buildCards(stats: DashboardStats): StatCard[] {
  return [
    {
      label: "Total Orders",
      value: stats.totalOrders,
      sublabel: "All active & completed",
      accent: "text-slate-900",
      iconBg: "bg-slate-100 text-slate-600",
    },
    {
      label: "Measurement Pending",
      value: stats.measurementPending,
      sublabel: "Awaiting site visit",
      accent: "text-amber-700",
      iconBg: "bg-amber-50 text-amber-600",
    },
    {
      label: "Under Production",
      value: stats.underProduction,
      sublabel: "Vendor assigned",
      accent: "text-blue-700",
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      label: "Ready",
      value: stats.ready,
      sublabel: "Ready for install",
      accent: "text-emerald-700",
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Installation Scheduled",
      value: stats.installationScheduled,
      sublabel: "Install date set",
      accent: "text-violet-700",
      iconBg: "bg-violet-50 text-violet-600",
    },
    {
      label: "Installed",
      value: stats.installed,
      sublabel: "On-site complete",
      accent: "text-cyan-700",
      iconBg: "bg-cyan-50 text-cyan-600",
    },
    {
      label: "Completed",
      value: stats.completed,
      sublabel: "Fully closed",
      accent: "text-green-700",
      iconBg: "bg-green-50 text-green-600",
    },
    {
      label: "Payment Pending",
      value: stats.paymentPending,
      sublabel: "Orders awaiting pay",
      accent: "text-orange-700",
      iconBg: "bg-orange-50 text-orange-600",
    },
    {
      label: "Pending Collection",
      value: formatCurrency(stats.pendingCollection),
      sublabel: "Outstanding amount",
      accent: "text-red-700",
      iconBg: "bg-red-50 text-red-600",
    },
  ];
}

type StatCardsProps = {
  stats: DashboardStats;
};

export function StatCards({ stats }: StatCardsProps) {
  const cards = buildCards(stats);

  return (
    <section>
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Order Pipeline
          </h2>
          <p className="text-sm text-slate-500">
            Item-level status counts across all orders
          </p>
        </div>
        <span className="text-xs text-slate-400">Updated today · May 26, 2026</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.label}
            className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/50 transition-shadow hover:shadow-md hover:shadow-slate-200/60"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {card.label}
                </p>
                <p
                  className={`mt-1 text-2xl font-bold tracking-tight ${card.accent}`}
                >
                  {card.value}
                </p>
                {card.sublabel && (
                  <p className="mt-0.5 text-xs text-slate-400">{card.sublabel}</p>
                )}
              </div>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                <span className="h-2 w-2 rounded-full bg-current opacity-60" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

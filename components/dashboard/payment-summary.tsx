import { formatCurrency } from "@/lib/status-config";
import type { PaymentSummary as PaymentSummaryType } from "@/lib/types";

type PaymentSummaryProps = {
  summary: PaymentSummaryType;
};

export function PaymentSummary({ summary }: PaymentSummaryProps) {
  const collectedPercent =
    summary.totalRevenue > 0
      ? Math.round((summary.collected / summary.totalRevenue) * 100)
      : 0;

  const rows = [
    {
      label: "Total Revenue",
      value: formatCurrency(summary.totalRevenue),
      bar: "bg-slate-300",
      width: "100%",
    },
    {
      label: "Collected",
      value: formatCurrency(summary.collected),
      bar: "bg-emerald-500",
      width: `${collectedPercent}%`,
    },
    {
      label: "Pending",
      value: formatCurrency(summary.pending),
      bar: "bg-amber-500",
      width: `${summary.totalRevenue > 0 ? Math.round((summary.pending / summary.totalRevenue) * 100) : 0}%`,
    },
    {
      label: "Overdue",
      value: formatCurrency(summary.overdue),
      bar: "bg-red-500",
      width: `${summary.totalRevenue > 0 ? Math.round((summary.overdue / summary.totalRevenue) * 100) : 0}%`,
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-slate-900">
          Payment Summary
        </h2>
        <p className="text-sm text-slate-500">Financial overview this month</p>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Collection Rate
          </p>
          <p className="mt-1 text-3xl font-bold">{collectedPercent}%</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all"
              style={{ width: `${collectedPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {formatCurrency(summary.collected)} of{" "}
            {formatCurrency(summary.totalRevenue)} collected
          </p>
        </div>

        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{row.label}</span>
                <span className="font-semibold text-slate-900">{row.value}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${row.bar} transition-all`}
                  style={{ width: row.width }}
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-100">
          <div>
            <p className="text-sm font-medium text-amber-900">
              Partial Payments
            </p>
            <p className="text-xs text-amber-700/80">Orders with balance due</p>
          </div>
          <span className="text-xl font-bold text-amber-800">
            {summary.partialPayments}
          </span>
        </div>
      </div>
    </section>
  );
}

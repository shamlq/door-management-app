import { ORDER_ITEM_STATUSES } from "@/lib/status-config";
import { StatusBadge } from "./status-badge";

export function WorkflowLegend() {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50 sm:p-6">
      <h2 className="text-base font-semibold text-slate-900">
        Item Status Workflow
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Each order item tracks status independently per vendor
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {ORDER_ITEM_STATUSES.map((status) => (
          <StatusBadge key={status} status={status} size="md" />
        ))}
      </div>
    </section>
  );
}

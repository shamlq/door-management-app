import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { CreateOrderForm } from "@/components/orders/create-order-form";
import { getCustomers, getVendors } from "@/lib/data/queries";

export default async function NewOrderPage() {
  const [customers, vendors] = await Promise.all([
    getCustomers(),
    getVendors(),
  ]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Create Order
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create a new customer order
          </p>
        </div>

        <CreateOrderForm
          customers={customers}
          vendors={vendors}
        />
      </div>
    </DashboardLayout>
  );
}
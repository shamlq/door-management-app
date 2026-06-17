import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { CustomerForm } from "@/components/forms/customer-form";
import { SupabaseBanner } from "@/components/ui/supabase-banner";
import { getCustomers } from "@/lib/data/queries";
import { canQueryDatabase } from "@/lib/data/safe-query";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserPermissions } from "@/lib/data/queries";
import { CustomersList } from "@/components/customers/customers-list";

export default async function CustomersPage() {
  const permissions = await getUserPermissions();

if (!permissions.includes("customers.view")) {
  redirect("/");
}
  const customers = (await canQueryDatabase()) ? await getCustomers() : [];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <SupabaseBanner />
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">
            Manage customers — one customer can have many orders
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <CustomerForm />

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                All Customers ({customers.length})
              </h2>
            </div>
            {customers.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500">No customers yet.</p>
            ) : (
              <CustomersList customers={customers} />
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

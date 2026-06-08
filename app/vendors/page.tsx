import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { VendorForm } from "@/components/forms/vendor-form";
import { SupabaseBanner } from "@/components/ui/supabase-banner";
import { getVendors } from "@/lib/data/queries";
import { canQueryDatabase } from "@/lib/data/safe-query";
import { redirect } from "next/navigation";
import { getUserPermissions } from "@/lib/data/queries";

export default async function VendorsPage() {
  const permissions = await getUserPermissions();

  if (!permissions.includes("vendors.view")) {
    redirect("/");
  }

  const vendors = (await canQueryDatabase()) ? await getVendors() : [];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <SupabaseBanner />
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Vendors</h1>
          <p className="text-sm text-slate-500">
            Assign vendors to order items — one vendor per item
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <VendorForm />
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                All Vendors ({vendors.length})
              </h2>
            </div>
            {vendors.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500">No vendors yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {vendors.map((v) => (
                  <li key={v.id} className="px-5 py-4">
                    <p className="font-medium text-slate-900">{v.name}</p>
                    {(v.contact_person || v.phone || v.email) && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {[v.contact_person, v.phone, v.email]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
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

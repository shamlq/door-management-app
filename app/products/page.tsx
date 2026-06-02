import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ProductsManager } from "@/components/products/products-manager";
import { SupabaseBanner } from "@/components/ui/supabase-banner";
import { getAllProductsAdmin } from "@/lib/data/products";
import { canQueryDatabase } from "@/lib/data/safe-query";

export default async function ProductsPage() {
  const products = (await canQueryDatabase()) ? await getAllProductsAdmin() : [];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <SupabaseBanner />
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Products</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Catalog used when creating orders and line items
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Run <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">supabase/migrations/004_products_and_order_items.sql</code> if the products table is missing.
        </div>
        <ProductsManager products={products} />
      </div>
    </DashboardLayout>
  );
}

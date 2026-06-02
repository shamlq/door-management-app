"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import {
  createProduct,
  setProductActive,
  updateProduct,
} from "@/lib/actions/products";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatCurrency } from "@/lib/status-config";
import type { Product } from "@/lib/types";

type ProductsManagerProps = {
  products: Product[];
};

const initialState = { success: false, error: "" };

export function ProductsManager({ products: initialProducts }: ProductsManagerProps) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return initialProducts;
    return initialProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [initialProducts, search]);

  const [createState, createAction] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createProduct(formData);
      return result.success
        ? { success: true, error: "" }
        : { success: false, error: result.error ?? "Failed" };
    },
    initialState
  );

  const [editState, editAction] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      if (!editing) return { success: false, error: "No product selected" };
      const result = await updateProduct(editing.id, formData);
      if (result.success) setEditing(null);
      return result.success
        ? { success: true, error: "" }
        : { success: false, error: result.error ?? "Failed" };
    },
    initialState
  );

  function toggleActive(product: Product) {
    startTransition(async () => {
      await setProductActive(product.id, !product.activeStatus);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-1">
        <form
          action={createAction}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Create Product
          </h3>
          <div className="mt-3 space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Name *</span>
              <input name="name" required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Category *</span>
              <input name="category" required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Base price (₹) *</span>
              <input name="base_price" type="number" min={0} required defaultValue={0} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Description</span>
              <textarea name="description" rows={2} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800" />
            </label>
          </div>
          {createState.error && <p className="mt-2 text-sm text-red-600">{createState.error}</p>}
          {createState.success && <p className="mt-2 text-sm text-emerald-600">Product created.</p>}
          <div className="mt-3">
            <SubmitButton label="Create Product" />
          </div>
        </form>

        {editing && (
          <form
            action={editAction}
            className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-800 dark:bg-amber-950/30"
          >
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Edit Product
            </h3>
            <div className="mt-3 space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Name *</span>
                <input name="name" required defaultValue={editing.name} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Category *</span>
                <input name="category" required defaultValue={editing.category} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Base price (₹)</span>
                <input name="base_price" type="number" min={0} defaultValue={editing.basePrice} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Description</span>
                <textarea name="description" rows={2} defaultValue={editing.description ?? ""} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800" />
              </label>
            </div>
            {editState.error && <p className="mt-2 text-sm text-red-600">{editState.error}</p>}
            <div className="mt-3 flex gap-2">
              <SubmitButton label="Save Changes" />
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg border px-3 py-2 text-sm dark:border-slate-600">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Products ({filtered.length})
            </h2>
            <input
              type="search"
              placeholder="Search name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm w-full sm:w-64 dark:border-slate-600 dark:bg-slate-800"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-5 py-3 font-semibold text-slate-600">Name</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Category</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Price</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((p) => (
                <tr key={p.id} className={!p.activeStatus ? "opacity-50" : ""}>
                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">{p.name}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{p.category}</td>
                  <td className="px-5 py-3">{formatCurrency(p.basePrice)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.activeStatus
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800"
                      }`}
                    >
                      {p.activeStatus ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditing(p)}
                      className="text-xs font-medium hover:underline"
                      style={{ color: "var(--accent)" }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => toggleActive(p)}
                      className="text-xs font-medium text-slate-600 hover:underline dark:text-slate-400"
                    >
                      {p.activeStatus ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="px-5 py-8 text-sm text-slate-500 text-center">No products found.</p>
          )}
        </div>
      </section>
    </div>
  );
}

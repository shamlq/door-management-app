"use client";

import { useActionState } from "react";
import { addOrderItem } from "@/lib/actions/order-items";
import { ProductAutocomplete } from "@/components/products/product-autocomplete";
import { SubmitButton } from "@/components/ui/submit-button";
import { ORDER_ITEM_STATUSES } from "@/lib/status-config";
import type { Vendor, OrderItemStatus } from "@/lib/supabase/database.types";
import type { Product } from "@/lib/types";
import { useState } from "react";

type AddOrderItemPanelProps = {
  orderId: string;
  vendors: Vendor[];
  defaultStatus: OrderItemStatus;
};

const initialState = { success: false, error: "" };

export function AddOrderItemPanel({
  orderId,
  vendors,
  defaultStatus,
}: AddOrderItemPanelProps) {
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [unitPrice, setUnitPrice] = useState(0);

  const [state, formAction] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      if (!productId) return { success: false, error: "Select a product" };
      formData.set("product_id", productId);
      formData.set("order_id", orderId);
      const result = await addOrderItem(formData);
      if (result.success) {
        setProductId("");
        setProductName("");
        setUnitPrice(0);
        return { success: true, error: "" };
      }
      return { success: false, error: result.error ?? "Failed to add item" };
    },
    initialState
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Add Product to Order
      </h3>
      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="order_id" value={orderId} />
        <input type="hidden" name="product_id" value={productId} />

        <div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Product *</span>
          {productName ? (
            <div className="mt-1 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
              <span>{productName}</span>
              <button
                type="button"
                className="text-xs text-red-600"
                onClick={() => {
                  setProductId("");
                  setProductName("");
                }}
              >
                Clear
              </button>
            </div>
          ) : (
            <div className="mt-1">
              <ProductAutocomplete
                onSelect={(p: Product) => {
                  setProductId(p.id);
                  setProductName(p.name);
                  setUnitPrice(p.basePrice);
                }}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Quantity</span>
            <input
              name="quantity"
              type="number"
              min={1}
              defaultValue={1}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Unit price (₹)</span>
            <input
              name="unit_price"
              type="number"
              min={0}
              value={unitPrice || ""}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-medium text-slate-600">Vendor (optional)</span>
          <select
            name="vendor_id"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="">No vendor</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-slate-600">Status</span>
          <select
            name="status"
            defaultValue={defaultStatus}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
          >
            {ORDER_ITEM_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-3 gap-2">
          <input name="width" type="number" placeholder="Width" className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800" />
          <input name="height" type="number" placeholder="Height" className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800" />
          <input name="depth" type="number" placeholder="Depth" className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800" />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.success && <p className="text-sm text-emerald-600">Item added.</p>}
        <SubmitButton label="Add Item" />
      </form>
    </section>
  );
}

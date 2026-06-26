"use client";

import { useActionState, useEffect, useTransition } from "react";
import {
  clearOrderItemVendor,
  deleteOrderItem,
  updateOrderItemFull,
} from "@/lib/actions/order-items";
import { ProductAutocomplete } from "@/components/products/product-autocomplete";
import { SubmitButton } from "@/components/ui/submit-button";
import { ORDER_ITEM_STATUSES } from "@/lib/status-config";
import type { Database } from "@/lib/supabase/database.types";
import type { OrderItem, Product } from "@/lib/types";

type Vendor =
  Database["public"]["Tables"]["vendors"]["Row"];

type EditOrderItemModalProps = {
  item: OrderItem | null;
  orderId: string;
  vendors: Vendor[];
  onClose: () => void;
};

const initialState = { success: false, error: "" };

export function EditOrderItemModal({
  item,
  orderId,
  vendors,
  onClose,
}: EditOrderItemModalProps) {
  const [isPending, startTransition] = useTransition();

  console.log("EDIT ITEM:", item);
console.log("PRODUCT ID:", item?.productId);

  const [state, formAction]  = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      if (!item) return { success: false, error: "No item selected" };
      const result = await updateOrderItemFull(item.id, orderId, formData);
      if (result.success) {
        onClose();
        return { success: true, error: "" };
      }
      return { success: false, error: result.error ?? "Update failed" };
    },
    initialState
  );


  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Edit Order Item
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">{item.name}</p>


        <form action={formAction} className="mt-4 space-y-4">
          <input type="hidden" name="product_id" id="edit-product-id" defaultValue={item.productId ?? ""} />

          <div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Change product
            </span>
            <div className="mt-1">
              <ProductAutocomplete
                placeholder="Search to replace product..."
                onSelect={(p: Product) => {
                  const el = document.getElementById("edit-product-id") as HTMLInputElement;
                  if (el) el.value = p.id;
                  const unitEl = document.getElementById("edit-unit-price") as HTMLInputElement;
                  if (unitEl) unitEl.value = String(p.basePrice);
                }}
              />
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Status</span>
            <select
              name="status"
              defaultValue={item.status}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            >
              {ORDER_ITEM_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Vendor (optional)
            </span>
            <select
              name="vendor_id"
              defaultValue={item.vendorId ?? "none"}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="none">No vendor assigned</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Quantity</span>
              <input
                name="quantity"
                type="number"
                min={1}
                defaultValue={item.quantity}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Unit price (₹)</span>
              <input
                id="edit-unit-price"
                name="unit_price"
                type="number"
                min={0}
                step={1}
                defaultValue={item.unitPrice}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
              />
            </label>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-600">Dimensions (optional)</span>
            <div className="mt-1 grid grid-cols-3 gap-2">
              <input
                name="width"
                type="number"
                min={0}
                step={0.01}
                placeholder="W"
                defaultValue={item.width ?? ""}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
              />
              <input
                name="height"
                type="number"
                min={0}
                step={0.01}
                placeholder="H"
                defaultValue={item.height ?? ""}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
              />
              <input
                name="depth"
                type="number"
                min={0}
                step={0.01}
                placeholder="D"
                defaultValue={item.depth ?? ""}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
              />
            </div>
          </div>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <div className="flex flex-wrap gap-2 pt-2">
            <SubmitButton label="Save Changes" />
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm dark:border-slate-600"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await clearOrderItemVendor(item.id, orderId);
                onClose();
              })
            }
            className="text-xs font-medium text-amber-700 hover:underline dark:text-amber-400 disabled:opacity-50"
          >
            Remove vendor
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (!confirm("Delete this order item?")) return;
              startTransition(async () => {
                await deleteOrderItem(item.id, orderId);
                onClose();
              });
            }}
            className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
          >
            Delete item
          </button>
        </div>
      </div>
    </div>
  );
}

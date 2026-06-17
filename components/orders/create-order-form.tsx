"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductAutocomplete } from "@/components/products/product-autocomplete";
import { SubmitButton } from "@/components/ui/submit-button";
import { createOrderWithItems } from "@/lib/actions/orders";
import { formatCurrency } from "@/lib/status-config";
import type { Database } from "@/lib/supabase/database.types";
import type { OrderLineInput, Product } from "@/lib/types";
import {
  CustomerAutocomplete,
  type Customer,
} from "@/components/customers/customer-autocomplete";

type DraftLine = OrderLineInput & {
  productName: string;
  category: string;
  basePrice: number;
};

type CreateOrderFormProps = {
  customers: Database["public"]["Tables"]["customers"]["Row"][];
  vendors: Database["public"]["Tables"]["vendors"]["Row"][];
};

const initialState = { success: false, error: "" };

export function CreateOrderForm({ customers, vendors }: CreateOrderFormProps) {
  const router = useRouter();
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [advancePaymentReceived, setAdvancePaymentReceived] = useState("");

  const [state, formAction] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      formData.set(
        "order_lines",
        JSON.stringify(
          lines.map((l) => ({
            productId: l.productId,
            vendorId: l.vendorId || null,
            quantity: l.quantity ?? 1,
            unitPrice: l.unitPrice,
            width: l.width,
            height: l.height,
            depth: l.depth,
          }))
        )
      );
      const result = await createOrderWithItems(formData);
      if (result.success && result.id) {
        router.push(`/orders/${result.id}`);
        return { success: true, error: "" };
      }
      return { success: false, error: result.error ?? "Failed to create order" };
    },
    initialState
  );

  function addProduct(product: Product) {
    if (lines.some((l) => l.productId === product.id)) return;
    setLines((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        category: product.category,
        basePrice: product.basePrice,
        unitPrice: product.basePrice,
        quantity: 1,
        vendorId: null,
      },
    ]);
  }

  function updateLine(index: number, patch: Partial<DraftLine>) {
    setLines((prev) =>
      prev.map((l, i) => (i === index ? { ...l, ...patch } : l))
    );
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  const total = lines.reduce(
    (s, l) => s + (l.quantity ?? 1) * (l.unitPrice ?? l.basePrice),
    0
  );

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Create Order
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
    Customer *
  </span>

  <input
    type="hidden"
    name="customer_id"
    value={selectedCustomer?.id ?? ""}
  />

  <div className="mt-1">
    <CustomerAutocomplete
      onSelect={(customer) => setSelectedCustomer(customer)}
      placeholder="Search customer by name or phone..."
    />
  </div>

  {selectedCustomer && (
    <p className="mt-1 text-xs text-green-600">
      Selected: {selectedCustomer.name} ({selectedCustomer.phone})
    </p>
  )}
</label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Location *</span>
          <input
            name="project_name"
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <label className="block">
  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
    Measurement Required *
  </span>
  <select
    name="measurement_required"
    required
    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
  >
    <option value="">Select</option>
    <option value="true">Yes</option>
    <option value="false">No</option>
  </select>
</label>

<label className="block">
  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
      Installation Required *
    </span>
    <select
      name="installation_required"
      required
      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
    >
      <option value="">Select</option>
      <option value="true">Yes</option>
      <option value="false">No</option>
    </select>
  </label>

  <label className="block">
    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
      Expected Delivery Date
    </span>
    <input
      type="date"
      name="expected_delivery_date"
      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
    />
  </label>

        </div>

        <div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Add products *</span>
          <div className="mt-1">
            <ProductAutocomplete onSelect={addProduct} />
          </div>

          
          
        </div>

        {lines.length > 0 && (
        <ul className="space-y-3">
          {lines.map((line, index) => (
            <li
              key={line.productId}
              className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/50"
            >
              <div className="flex justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {line.productName}
                  </p>
                  <p className="text-xs text-slate-500">{line.category}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[10px] text-slate-500">Qty</span>
                  <input
                    type="number"
                    min={1}
                    value={line.quantity ?? 1}
                    onChange={(e) =>
                      updateLine(index, { quantity: Number(e.target.value) })
                    }
                    className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] text-slate-500">Unit price (₹)</span>
                  <input
                    type="number"
                    min={0}
                    value={line.unitPrice ?? line.basePrice}
                    onChange={(e) =>
                      updateLine(index, { unitPrice: Number(e.target.value) })
                    }
                    className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
                  />
                </label>
                
              </div>
              <p className="mt-2 text-sm font-semibold text-right">
  Amount: {formatCurrency((line.quantity ?? 1) * (line.unitPrice ?? line.basePrice))}
</p>
            </li>
          ))}
        </ul>
      )}

{lines.length > 0 && (
  <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-right text-sm font-semibold dark:bg-slate-800">
    Order Total: {formatCurrency(
      lines.reduce(
        (sum, line) =>
          sum + ((line.quantity ?? 1) * (line.unitPrice ?? line.basePrice)),
        0
      )
    )}
  </div>
)}  

<div className="grid gap-4 sm:grid-cols-3">
  <label className="block">
    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
      Advance Payment Received *
    </span>
    <select
      name="advance_payment_received"
      required
      value={advancePaymentReceived}
      onChange={(e) => setAdvancePaymentReceived(e.target.value)}
      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
    >
      <option value="">Select</option>
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </select>
  </label>

  {advancePaymentReceived === "yes" && (
    <>
      <label className="block">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Advance Amount
        </span>
        <input
          type="number"
          name="advance_amount"
          min="0"
          step="0.01"
          placeholder="0.00"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>

      <label className="block">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Advance Payment Method
        </span>
        <select
          name="advance_payment_method"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="">Select Method</option>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Cheque">Cheque</option>
        </select>
      </label>
    </>
  )}
</div>

     


<label className="block">
  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
    Notes
  </span>
  <textarea
    name="notes"
    rows={4}
    placeholder="Special instructions, customer requests, delivery notes..."
    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
  />
</label>


      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton label="Create Order" />
    </form>
  );
}

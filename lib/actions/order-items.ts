"use server";

import { revalidatePath } from "next/cache";
import { getErpSettings } from "@/lib/data/settings";
import { getProductById } from "@/lib/data/products";
import { createClient } from "@/lib/supabase/server";
import { calculateOrderWorkflow } from "@/lib/workflow";
import type { OrderItemStatus } from "@/lib/types";
import type { ActionResult } from "./customers";
import { ORDER_ITEM_STATUSES } from "@/lib/status-config";

function revalidateOrder(orderId: string) {
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  revalidatePath("/");
}

function parseVendorId(raw: string | null | undefined): string | null {
  if (!raw || raw === "" || raw === "none") return null;
  return raw;
}

function calcAmount(quantity: number, unitPrice: number) {
  return Math.round(quantity * unitPrice * 100) / 100;
}

async function updateOrderWorkflow(orderId: string) {
  const supabase = await createClient();

  const { data: items, error } = await supabase
    .from("order_items")
    .select("status")
    .eq("order_id", orderId);

  if (error || !items) return;

  const statuses = items.map((item) => item.status);

  const workflowStatus = calculateOrderWorkflow(statuses);

  await supabase
  .from("orders")
  .update({
    workflow_status: workflowStatus,
  } as any)
  .eq("id", orderId);
}

export async function addOrderItem(formData: FormData): Promise<ActionResult> {
  const orderId = formData.get("order_id")?.toString();
  const productId = formData.get("product_id")?.toString();
  const settings = await getErpSettings();
  const status = (formData.get("status")?.toString() ||
    settings.default_item_status) as OrderItemStatus;

  if (!orderId) return { success: false, error: "Order is required" };
  if (!productId) return { success: false, error: "Product is required" };
  if (!ORDER_ITEM_STATUSES.includes(status)) {
    return { success: false, error: "Invalid status" };
  }

  const product = await getProductById(productId);
  if (!product) return { success: false, error: "Product not found" };

  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));
  const unitPrice = Number(formData.get("unit_price") ?? product.basePrice);
  const amount = calcAmount(quantity, unitPrice);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_items")
    .insert({
      order_id: orderId,
      product_id: product.id,
      name: product.name,
      vendor_id: parseVendorId(formData.get("vendor_id")?.toString()),
      status,
      quantity,
      unit_price: unitPrice,
      amount,
      width: formData.get("width") ? Number(formData.get("width")) : null,
      height: formData.get("height") ? Number(formData.get("height")) : null,
      depth: formData.get("depth") ? Number(formData.get("depth")) : null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidateOrder(orderId);
  return { success: true, id: data.id };
}

export async function updateOrderItemFull(
  itemId: string,
  orderId: string,
  formData: FormData
): Promise<ActionResult> {
  const productId = formData.get("product_id")?.toString();
  console.log("EDIT PRODUCT ID:", productId);
  const status = formData.get("status")?.toString() as OrderItemStatus;
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));
  const unitPrice = Number(formData.get("unit_price") ?? 0);
  const amount = calcAmount(quantity, unitPrice);

  if (!productId) return { success: false, error: "Product is required" };
  if (!ORDER_ITEM_STATUSES.includes(status)) {
    return { success: false, error: "Invalid status" };
  }

  const product = await getProductById(productId);

console.log("PRODUCT FOUND:", product);

if (!product)
  return { success: false, error: "Product not found" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("order_items")
    .update({
      product_id: product.id,
      name: product.name,
      vendor_id: parseVendorId(formData.get("vendor_id")?.toString()),
      status,
      quantity,
      unit_price: unitPrice,
      amount,
      width: formData.get("width") ? Number(formData.get("width")) : null,
      height: formData.get("height") ? Number(formData.get("height")) : null,
      depth: formData.get("depth") ? Number(formData.get("depth")) : null,
    })
    .eq("id", itemId);

  if (error) return { success: false, error: error.message };

await updateOrderWorkflow(orderId);

revalidateOrder(orderId);
return { success: true };
}

export async function updateOrderItemStatus(
  itemId: string,
  orderId: string,
  status: OrderItemStatus
): Promise<ActionResult> {
  if (!ORDER_ITEM_STATUSES.includes(status)) {
    return { success: false, error: "Invalid status" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("order_items")
    .update({ status })
    .eq("id", itemId);

  if (error) return { success: false, error: error.message };

  revalidateOrder(orderId);
  return { success: true };
}

export async function clearOrderItemVendor(
  itemId: string,
  orderId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("order_items")
    .update({ vendor_id: null })
    .eq("id", itemId);

  if (error) return { success: false, error: error.message };

  revalidateOrder(orderId);
  return { success: true };
}

export async function deleteOrderItem(
  itemId: string,
  orderId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("order_items").delete().eq("id", itemId);

  if (error) return { success: false, error: error.message };

  revalidateOrder(orderId);
  return { success: true };
}

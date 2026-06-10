"use server";

import { revalidatePath } from "next/cache";
import { getErpSettings } from "@/lib/data/settings";
import { getProductById } from "@/lib/data/products";
import { createClient } from "@/lib/supabase/server";
import type { OrderLineInput } from "@/lib/types";
import type { ActionResult } from "./customers";

import { ORDER_ITEM_STATUSES } from "@/lib/status-config";

async function generateOrderNumber(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data, error } = await supabase.rpc("generate_order_number");
  if (error || !data) {
    const year = new Date().getFullYear();
    const suffix = String(Date.now()).slice(-4);
    return `DH-${year}-${suffix}`;
  }
  return data as string;
}

function parseOrderLines(raw: string | null): OrderLineInput[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as OrderLineInput[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function lineAmount(line: OrderLineInput, unitPrice: number, quantity: number) {
  return quantity * unitPrice;
}

export async function createOrderWithItems(formData: FormData): Promise<ActionResult> {
  const customerId = formData.get("customer_id")?.toString();
  const projectName = formData.get("project_name")?.toString().trim();


  const measurementRequired =
  formData.get("measurement_required")?.toString() === "true";

const installationRequired =
  formData.get("installation_required")?.toString() === "true";
  const lines = parseOrderLines(formData.get("order_lines")?.toString() ?? null);

  if (!customerId) return { success: false, error: "Customer is required" };
  if (!projectName) return { success: false, error: "Project name is required" };
  if (lines.length === 0) {
    return { success: false, error: "Add at least one product to the order" };
  }

  const supabase = await createClient();
  const settings = await getErpSettings();
  const orderNumber =
    formData.get("order_number")?.toString().trim() ||
    (await generateOrderNumber(supabase));

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
  customer_id: customerId,
  order_number: orderNumber,
  project_name: projectName,
  measurement_required: measurementRequired,
  installation_required: installationRequired,
  payment_status: settings.default_payment_status,
  paid_amount: 0,
})
    .select("id")
    .single();

  if (orderError) return { success: false, error: orderError.message };

const defaultStatus = settings.default_item_status;

  for (const line of lines) {
    const product = await getProductById(line.productId);
    if (!product) {
      return { success: false, error: "One or more products were not found" };
    }

    const quantity = Math.max(1, line.quantity ?? 1);
    const unitPrice = line.unitPrice ?? product.basePrice;
    const amount = lineAmount(line, unitPrice, quantity);
    const vendorId =
      line.vendorId && line.vendorId !== "" ? line.vendorId : null;

    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: product.id,
      name: product.name,
      vendor_id: vendorId,
      status: defaultStatus,
      quantity,
      unit_price: unitPrice,
      amount,
      width: line.width ?? null,
      height: line.height ?? null,
      depth: line.depth ?? null,
    });

    if (itemError) return { success: false, error: itemError.message };
  }

  revalidatePath("/orders");
  revalidatePath("/");
  return { success: true, id: order.id };
}

export async function createOrder(formData: FormData): Promise<ActionResult> {
  const lines = formData.get("order_lines")?.toString();
  if (lines) return createOrderWithItems(formData);

  const customerId = formData.get("customer_id")?.toString();
  const projectName = formData.get("project_name")?.toString().trim();

  const measurementRequired =
  formData.get("measurement_required")?.toString() === "true";

  const installationRequired =
  formData.get("installation_required")?.toString() === "true";



  if (!customerId) return { success: false, error: "Customer is required" };
  if (!projectName) return { success: false, error: "Project name is required" };

  const supabase = await createClient();
  const settings = await getErpSettings();
  const orderNumber =
    formData.get("order_number")?.toString().trim() ||
    (await generateOrderNumber(supabase));

  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      order_number: orderNumber,
      project_name: projectName,
      payment_status: settings.default_payment_status,
      paid_amount: 0,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/orders");
  revalidatePath("/");
  return { success: true, id: data.id };
}

export async function updateOrder(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const projectName = formData.get("project_name")?.toString().trim();
  if (!projectName) return { success: false, error: "Project name is required" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({
      project_name: projectName,
      customer_id: formData.get("customer_id")?.toString() || undefined,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/orders/${id}`);
  revalidatePath("/orders");
  revalidatePath("/");
  return { success: true };
}

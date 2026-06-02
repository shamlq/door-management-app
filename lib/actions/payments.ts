"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PaymentStatus } from "@/lib/supabase/database.types";
import type { ActionResult } from "./customers";

const PAYMENT_STATUSES: PaymentStatus[] = [
  "Paid",
  "Partial",
  "Pending",
  "Overdue",
];

export async function createPayment(formData: FormData): Promise<ActionResult> {
  const orderId = formData.get("order_id")?.toString();
  const amount = Number(formData.get("amount") ?? 0);
  const paymentDate =
    formData.get("payment_date")?.toString() ||
    new Date().toISOString().split("T")[0];

  if (!orderId) return { success: false, error: "Order is required" };
  if (amount <= 0) return { success: false, error: "Amount must be greater than 0" };

  const supabase = await createClient();
  const { error } = await supabase.from("payments").insert({
    order_id: orderId,
    amount,
    payment_date: paymentDate,
    method: formData.get("method")?.toString().trim() || null,
    notes: formData.get("notes")?.toString().trim() || null,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/payments");
  revalidatePath("/");
  return { success: true };
}

export async function   updateOrderPayment(
  orderId: string,
  formData: FormData
): Promise<ActionResult> {
  const paidAmount =
  Number(formData.get("paid_amount") ?? 0);

let paymentStatus: PaymentStatus = "Pending";

  
const supabase = await createClient();

const { data: order } = await supabase
  .from("orders")
  .select("*")
  .eq("id", orderId)
  .single();

if (!order) {
  return {
    success: false,
    error: "Order not found",
  };
}
if (paidAmount <= 0) {
  paymentStatus = "Pending";
} else if (paidAmount >= order.paid_amount) {
  paymentStatus = "Paid";
} else {
  paymentStatus = "Partial";
}

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: paymentStatus,
      paid_amount: paidAmount,
    })
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/payments");
  revalidatePath("/");
  return { success: true };
}

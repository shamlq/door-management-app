"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./customers";
import type { Database } from "@/lib/supabase/database.types";

const PAYMENT_STATUSES = [
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
  const { data: latestReceipt } = await supabase
  .from("payments")
  .select("receipt_no")
  .not("receipt_no", "is", null)
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();

let receiptNo = "PR-00001";

if (latestReceipt?.receipt_no) {
  const current =
    Number(latestReceipt.receipt_no.replace("PR-", ""));

  receiptNo =
    `PR-${String(current + 1).padStart(5, "0")}`;
}
  const { error } = await supabase.from("payments").insert({
    
    order_id: orderId,
    amount,
    payment_date: paymentDate,
    method: formData.get("method")?.toString().trim() || null,
    receipt_no: receiptNo,
    discount_amount:
  Number(formData.get("discount_amount") ?? 0),
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

let paymentStatus: Database["public"]["Enums"]["payment_status"] = "Pending";

  
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

export async function deletePayment(
  paymentId: string,
  orderId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("payments")
    .delete()
    .eq("id", paymentId);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/payments");
  revalidatePath("/");

  return { success: true };
}
export async function updatePayment(
  paymentId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("payments")
    .update({
      amount: Number(formData.get("amount") ?? 0),
      payment_date: formData.get("payment_date")?.toString(),
      method: formData.get("method")?.toString().trim() || null,
      notes: formData.get("notes")?.toString().trim() || null,
      discount_amount:
        Number(formData.get("discount_amount") ?? 0),
    })
    .eq("id", paymentId);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/payments");
  revalidatePath("/");
  return { success: true };
}
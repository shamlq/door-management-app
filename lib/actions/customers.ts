"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { success: boolean; error?: string; id?: string };

export async function createCustomer(formData: FormData): Promise<ActionResult> {
  const name = formData.get("name")?.toString().trim();
  if (!name) return { success: false, error: "Customer name is required" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .insert({
      name,
      email: formData.get("email")?.toString().trim() || null,
      phone: formData.get("phone")?.toString().trim() || null,
      address: formData.get("address")?.toString().trim() || null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/customers");
  revalidatePath("/orders");
  revalidatePath("/");
  return { success: true, id: data.id };
}

export async function updateCustomer(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const name = formData.get("name")?.toString().trim();
  if (!name) return { success: false, error: "Customer name is required" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("customers")
    .update({
      name,
      email: formData.get("email")?.toString().trim() || null,
      phone: formData.get("phone")?.toString().trim() || null,
      address: formData.get("address")?.toString().trim() || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/customers");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/customers");
  revalidatePath("/");
  return { success: true };
}


export async function searchCustomersAction(query: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("customers")
    .select("*")
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
    .limit(20);

  return data ?? [];
}



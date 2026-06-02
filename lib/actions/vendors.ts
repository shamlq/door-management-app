"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./customers";

export async function createVendor(formData: FormData): Promise<ActionResult> {
  const name = formData.get("name")?.toString().trim();
  if (!name) return { success: false, error: "Vendor name is required" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendors")
    .insert({
      name,
      contact_person: formData.get("contact_person")?.toString().trim() || null,
      phone: formData.get("phone")?.toString().trim() || null,
      email: formData.get("email")?.toString().trim() || null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/vendors");
  revalidatePath("/orders");
  return { success: true, id: data.id };
}

export async function deleteVendor(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("vendors").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/vendors");
  return { success: true };
}

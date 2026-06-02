"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./customers";

export async function searchProductsAction(query: string) {
  const { getProducts } = await import("@/lib/data/products");
  return getProducts({ activeOnly: true, search: query });
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  const name = formData.get("name")?.toString().trim();
  const category = formData.get("category")?.toString().trim();
  const basePrice = Number(formData.get("base_price") ?? 0);

  if (!name) return { success: false, error: "Product name is required" };
  if (!category) return { success: false, error: "Category is required" };
  if (basePrice < 0) return { success: false, error: "Invalid base price" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      category,
      base_price: basePrice,
      description: formData.get("description")?.toString().trim() || null,
      active_status: true,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/products");
  return { success: true, id: data.id };
}

export async function updateProduct(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const name = formData.get("name")?.toString().trim();
  const category = formData.get("category")?.toString().trim();
  const basePrice = Number(formData.get("base_price") ?? 0);

  if (!name) return { success: false, error: "Product name is required" };
  if (!category) return { success: false, error: "Category is required" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name,
      category,
      base_price: basePrice,
      description: formData.get("description")?.toString().trim() || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/products");
  revalidatePath("/orders");
  return { success: true };
}

export async function setProductActive(
  id: string,
  active: boolean
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ active_status: active })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/products");
  return { success: true };
}

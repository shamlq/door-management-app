import { createClient } from "@/lib/supabase/server";
import { canQueryDatabase } from "@/lib/data/safe-query";
import type { Product } from "@/lib/types";

type ProductRow = {
  id: string;
  name: string;
  category: string;
  base_price: number;
  description: string | null;
  active_status: boolean;
};

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    basePrice: Number(row.base_price),
    description: row.description,
    activeStatus: row.active_status,
  };
}

export async function getProducts(options?: {
  activeOnly?: boolean;
  search?: string;
}): Promise<Product[]> {
  if (!(await canQueryDatabase())) return [];

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("id, name, category, base_price, description, active_status")
    .order("name");

  if (options?.activeOnly !== false) {
    query = query.eq("active_status", true);
  }

  if (options?.search?.trim()) {
    const q = options.search.trim().replace(/%/g, "");
    query = query.or(`name.ilike.%${q}%,category.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as ProductRow[]).map(mapProduct);
}

export async function searchProducts(query: string, limit = 20): Promise<Product[]> {
  return getProducts({ activeOnly: true, search: query, });
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!(await canQueryDatabase())) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, category, base_price, description, active_status")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapProduct(data as ProductRow);
}

export async function getAllProductsAdmin(search?: string): Promise<Product[]> {
  if (!(await canQueryDatabase())) return [];

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("id, name, category, base_price, description, active_status")
    .order("name");

  if (search?.trim()) {
    const q = search.trim().replace(/%/g, "");
    query = query.or(`name.ilike.%${q}%,category.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as ProductRow[]).map(mapProduct);
}

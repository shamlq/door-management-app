import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "./config";
import type { Database } from "./database.types";

export function createClient() {
  const url = getSupabaseUrl()!;
  const key = getSupabaseAnonKey()!;
  return createBrowserClient<Database>(url, key);
}

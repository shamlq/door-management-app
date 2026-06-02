/** Normalize project URL — must NOT include /rest/v1 */
export function getSupabaseUrl(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return undefined;
  return raw.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
}

export function getSupabaseAnonKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

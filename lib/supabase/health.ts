import { getSupabaseAnonKey, getSupabaseUrl } from "./config";

export type SupabaseHealth = {
  connected: boolean;
  tablesReady: boolean;
  error?: string;
  missingTables?: string[];
};

const REQUIRED_TABLES = [
  "customers",
  "orders",
  "order_items",
  "vendors",
  "payments",
] as const;

export async function checkSupabaseHealth(): Promise<SupabaseHealth> {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (!url || !key) {
    return {
      connected: false,
      tablesReady: false,
      error: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    };
  }

  try {
    const res = await fetch(`${url}/rest/v1/customers?select=id&limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      cache: "no-store",
    });

    if (res.status === 404) {
      const body = await res.json().catch(() => ({}));
      if (body?.code === "PGRST205") {
        return {
          connected: true,
          tablesReady: false,
          error: "Database tables not created yet",
          missingTables: [...REQUIRED_TABLES],
        };
      }
    }

    if (!res.ok) {
      const text = await res.text();
      return {
        connected: false,
        tablesReady: false,
        error: `API error ${res.status}: ${text.slice(0, 120)}`,
      };
    }

    return { connected: true, tablesReady: true };
  } catch (e) {
    return {
      connected: false,
      tablesReady: false,
      error: e instanceof Error ? e.message : "Connection failed",
    };
  }
}

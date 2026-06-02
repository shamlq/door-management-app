import { checkSupabaseHealth } from "@/lib/supabase/health";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Only run DB queries when env is set and migrations have been applied */
export async function canQueryDatabase(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const health = await checkSupabaseHealth();
  return health.tablesReady;
}

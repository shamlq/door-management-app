import Link from "next/link";
import { checkSupabaseHealth } from "@/lib/supabase/health";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function SupabaseBanner() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-medium">Supabase not configured</p>
        <p className="mt-1 text-amber-800/90">
          Add <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
          <code className="rounded bg-amber-100 px-1">.env.local</code>. URL must be{" "}
          <code className="rounded bg-amber-100 px-1">https://xxx.supabase.co</code> (no /rest/v1).
        </p>
      </div>
    );
  }

  const health = await checkSupabaseHealth();

  if (health.tablesReady) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Connected to Supabase
        </span>
        <Link href="/setup" className="text-xs font-medium underline hover:no-underline">
          Setup docs
        </Link>
      </div>
    );
  }

  if (health.connected && !health.tablesReady) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-medium">Database tables not found</p>
        <p className="mt-1 text-amber-800/90">
          Your API keys work, but migrations haven&apos;t been applied yet. Run the SQL in{" "}
          <code className="rounded bg-amber-100 px-1">supabase/migrations/</code> via the
          Supabase SQL Editor.
        </p>
        <Link
          href="/setup"
          className="mt-2 inline-block rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
        >
          Open setup guide →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
      <p className="font-medium">Supabase connection failed</p>
      <p className="mt-1">{health.error}</p>
      <p className="mt-2 text-xs text-red-700">
        Check that <code className="rounded bg-red-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code> is
        your project URL without <code className="rounded bg-red-100 px-1">/rest/v1</code>.
      </p>
    </div>
  );
}

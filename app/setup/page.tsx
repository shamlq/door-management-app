import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SupabaseBanner } from "@/components/ui/supabase-banner";
import { CopySqlBlock } from "@/components/setup/copy-sql-block";
import { checkSupabaseHealth } from "@/lib/supabase/health";
import { isSupabaseConfigured } from "@/lib/supabase/config";

async function loadMigration(filename: string) {
  const filePath = path.join(process.cwd(), "supabase", "migrations", filename);
  return readFile(filePath, "utf-8");
}

export default async function SetupPage() {
  const health = isSupabaseConfigured()
    ? await checkSupabaseHealth()
    : null;

  const schema = await loadMigration("schema.sql");

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-slate-900">
            Supabase Setup
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Apply migrations in your Supabase SQL Editor
          </p>
        </div>

        <SupabaseBanner />

        {health?.tablesReady && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            All tables are ready.{" "}
            <Link href="/" className="font-medium underline">
              Go to dashboard
            </Link>
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 text-sm text-slate-600">
          <h2 className="font-semibold text-slate-900">Steps</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Open{" "}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-900 underline"
              >
                Supabase Dashboard
              </a>{" "}
              → your project → <strong>SQL Editor</strong>
            </li>
            <li>
              Fix <code className="bg-slate-100 px-1 rounded">.env.local</code> if needed: URL
              must be <code className="bg-slate-100 px-1 rounded">https://PROJECT.supabase.co</code>{" "}
              (remove <code className="bg-slate-100 px-1 rounded">/rest/v1</code>)
            </li>
            <li>
              Run the complete <code className="bg-slate-100 px-1 rounded">schema.sql</code>{" "}
              below (includes sample data)
            </li>
            <li>Restart <code className="bg-slate-100 px-1 rounded">npm run dev</code></li>
          </ol>
        </section>

        <CopySqlBlock title="Complete schema + sample data" sql={schema} />
      </div>
    </DashboardLayout>
  );
}

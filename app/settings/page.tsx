import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { AppearanceSettingsForm } from "@/components/settings/appearance-settings-form";
import { BusinessSettingsForm } from "@/components/settings/business-settings-form";
import { OrderSettingsForm } from "@/components/settings/order-settings-form";
import { SettingsNav } from "@/components/settings/settings-nav";
import { VendorSettingsForm } from "@/components/settings/vendor-settings-form";
import { WorkflowSettingsForm } from "@/components/settings/workflow-settings-form";
import { SupabaseBanner } from "@/components/ui/supabase-banner";
import { getErpSettings } from "@/lib/data/settings";
import { checkSupabaseHealth } from "@/lib/supabase/health";

export default async function SettingsPage() {
  const health = await checkSupabaseHealth();
  const settings = await getErpSettings();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <SupabaseBanner />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Settings
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Configure DoorHub ERP — saved to Supabase
            </p>
          </div>
          {!health.tablesReady && (
            <Link
              href="/setup"
              className="text-sm font-medium text-amber-700 underline dark:text-amber-400"
            >
              Run database setup first →
            </Link>
          )}
        </div>

        {health.tablesReady === false && health.connected && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            Apply{" "}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">
              supabase/migrations/003_erp_settings.sql
            </code>{" "}
            in the SQL Editor to enable settings storage. Showing defaults until then.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <SettingsNav />
          </aside>

          <div className="space-y-8">
            <div id="order">
              <OrderSettingsForm settings={settings} />
            </div>
            <div id="vendor">
              <VendorSettingsForm settings={settings} />
            </div>
            <div id="workflow">
              <WorkflowSettingsForm settings={settings} />
            </div>
            <div id="business">
              <BusinessSettingsForm settings={settings} />
            </div>
            <div id="appearance">
              <AppearanceSettingsForm settings={settings} />
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center pb-4">
          Last updated: {new Date(settings.updated_at).toLocaleString()}
        </p>
      </div>
    </DashboardLayout>
  );
}

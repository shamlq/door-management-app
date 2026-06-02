type SettingsSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export const inputClassName =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";

export const labelClassName = "text-xs font-medium text-slate-600 dark:text-slate-400";

export function FormMessage({
  error,
  success,
}: {
  error?: string;
  success?: boolean;
}) {
  if (error) return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  if (success) return <p className="text-sm text-emerald-600 dark:text-emerald-400">Saved successfully.</p>;
  return null;
}

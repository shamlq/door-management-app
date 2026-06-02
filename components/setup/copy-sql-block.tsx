"use client";

import { useState } from "react";

type CopySqlBlockProps = {
  title: string;
  sql: string;
};

export function CopySqlBlock({ title, sql }: CopySqlBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
        >
          {copied ? "Copied!" : "Copy SQL"}
        </button>
      </div>
      <pre className="max-h-80 overflow-auto p-4 text-xs text-slate-700 bg-slate-50 leading-relaxed">
        {sql}
      </pre>
    </section>
  );
}

/**
 * Quick Supabase connectivity + schema check.
 * Usage: npm run db:check
 */
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    }
  } catch {
    console.error("No .env.local found");
    process.exit(1);
  }
}

loadEnv();

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "")
  .replace(/\/rest\/v1\/?$/i, "")
  .replace(/\/+$/, "");
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

console.log("Project URL:", url);

const res = await fetch(`${url}/rest/v1/customers?select=id&limit=1`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});

if (res.status === 404) {
  const body = await res.json().catch(() => ({}));
  if (body?.code === "PGRST205") {
    console.log("\n✓ API keys work");
    console.log("✗ Tables missing — run migrations at http://localhost:3000/setup");
    console.log("  Or paste supabase/migrations/001_initial_schema.sql in SQL Editor");
    process.exit(2);
  }
}

if (!res.ok) {
  console.error("✗ API error", res.status, await res.text());
  process.exit(1);
}

console.log("\n✓ Connected");
console.log("✓ Tables ready");
process.exit(0);

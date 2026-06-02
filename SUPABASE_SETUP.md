# Supabase Setup

## 1. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a project.
2. Open **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Configure environment

Copy `env.example` to `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

**Important:** URL must be `https://PROJECT.supabase.co` only — do **not** include `/rest/v1`.

Verify connection:

```bash
npm run db:check
```

Or open **http://localhost:3000/setup** in the app for copy-paste SQL migrations.

Restart the dev server after saving.

## 3. Run database migrations

In the Supabase dashboard, open **SQL Editor** and run these files in order:

1. `supabase/migrations/001_initial_schema.sql` — tables, enums, triggers, RLS
2. `supabase/migrations/002_seed_data.sql` — optional sample customers, vendors, orders

## 4. Schema overview

| Table | Relationships |
|-------|----------------|
| `customers` | One customer → many `orders` |
| `orders` | Belongs to `customers`; has many `order_items` and `payments` |
| `order_items` | Belongs to `orders`; optional `vendor_id` → `vendors` |
| `vendors` | Referenced by `order_items` |
| `payments` | Belongs to `orders`; trigger syncs `orders.paid_amount` |

## 5. CRUD in the app

| Action | Where |
|--------|--------|
| Create customer | `/customers` |
| Create order | `/orders` |
| Add order items | `/orders/[id]` |
| Update item status | Dropdown on `/orders/[id]` |
| Record payment | `/orders/[id]` |
| Update payment status | `/orders/[id]` |

## 6. Security note

RLS policies currently allow all operations for development. Before production, replace them with authenticated-user policies.

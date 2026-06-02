-- =============================================================================
-- DoorHub ERP — Complete Supabase SQL Schema
-- Door & Hardware Order Management System
--
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query → Run
--
-- Relationships:
--   customers (1) ──→ (N) orders
--   orders    (1) ──→ (N) order_items
--   orders    (1) ──→ (N) payments
--   vendors   (1) ──→ (N) order_items  (optional per item)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Clean slate (development only — comment out if appending to existing DB)
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS payments_sync_order ON payments;
DROP TRIGGER IF EXISTS order_items_updated_at ON order_items;
DROP TRIGGER IF EXISTS orders_updated_at ON orders;
DROP TRIGGER IF EXISTS vendors_updated_at ON vendors;
DROP TRIGGER IF EXISTS customers_updated_at ON customers;

DROP TABLE IF EXISTS erp_settings CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

DROP FUNCTION IF EXISTS sync_order_paid_amount() CASCADE;
DROP FUNCTION IF EXISTS generate_order_number() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

DROP SEQUENCE IF EXISTS order_number_seq CASCADE;

DROP TYPE IF EXISTS order_item_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- -----------------------------------------------------------------------------
-- 1. ENUM types
-- -----------------------------------------------------------------------------

CREATE TYPE order_item_status AS ENUM (
  'New',
  'Measurement Pending',
  'Vendor Assigned',
  'Ready',
  'Installation Scheduled',
  'Installed',
  'Completed'
);

CREATE TYPE payment_status AS ENUM (
  'Paid',
  'Partial',
  'Pending',
  'Overdue'
);

-- -----------------------------------------------------------------------------
-- 2. TABLES
-- -----------------------------------------------------------------------------

-- customers: people or businesses placing orders
CREATE TABLE customers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  address     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE customers IS 'End customers; one customer can have many orders';

-- vendors: suppliers assigned per order line item
CREATE TABLE vendors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  contact_person  TEXT,
  phone           TEXT,
  email           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE vendors IS 'Hardware/door vendors; referenced by order_items';

-- orders: project-level order header linked to one customer
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID NOT NULL,
  order_number    TEXT NOT NULL,
  project_name    TEXT NOT NULL,
  payment_status  payment_status NOT NULL DEFAULT 'Pending',
  paid_amount     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT orders_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  CONSTRAINT orders_order_number_key UNIQUE (order_number),
  CONSTRAINT orders_paid_amount_nonneg CHECK (paid_amount >= 0)
);

COMMENT ON TABLE orders IS 'Order header; payment_status and paid_amount sync from payments trigger';
COMMENT ON COLUMN orders.payment_status IS 'Paid | Partial | Pending | Overdue';

-- order_items: line items with independent status and optional vendor
CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL,
  vendor_id   UUID,
  name        TEXT NOT NULL,
  status      order_item_status NOT NULL DEFAULT 'New',
  amount      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT order_items_order_id_fkey
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT order_items_vendor_id_fkey
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
  CONSTRAINT order_items_amount_nonneg CHECK (amount >= 0)
);

COMMENT ON TABLE order_items IS 'One order has many items; each item has one optional vendor and its own status';
COMMENT ON COLUMN order_items.status IS 'Workflow: New → Measurement Pending → Vendor Assigned → Ready → Installation Scheduled → Installed → Completed';

-- payments: payment transactions against an order
CREATE TABLE payments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL,
  amount        NUMERIC(12, 2) NOT NULL,
  payment_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  method        TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT payments_order_id_fkey
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT payments_amount_positive CHECK (amount > 0)
);

COMMENT ON TABLE payments IS 'Payment ledger; inserts update orders.paid_amount via trigger';

-- -----------------------------------------------------------------------------
-- 3. INDEXES
-- -----------------------------------------------------------------------------

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_vendor_id ON order_items(vendor_id);
CREATE INDEX idx_order_items_status ON order_items(status);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date DESC);

CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_vendors_name ON vendors(name);

-- -----------------------------------------------------------------------------
-- 4. TRIGGERS — auto-update updated_at
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER order_items_updated_at
  BEFORE UPDATE ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- 5. ORDER NUMBER GENERATOR
-- -----------------------------------------------------------------------------

CREATE SEQUENCE order_number_seq START WITH 1000;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'DH-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('order_number_seq')::text, 4, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION generate_order_number() TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 6. PAYMENT SYNC — keep orders.paid_amount & payment_status in sync
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION sync_order_paid_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_id    UUID;
  v_total_paid  NUMERIC(12, 2);
  v_order_total NUMERIC(12, 2);
  v_new_status  payment_status;
BEGIN
  v_order_id := COALESCE(NEW.order_id, OLD.order_id);

  SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
  FROM payments WHERE order_id = v_order_id;

  SELECT COALESCE(SUM(amount), 0) INTO v_order_total
  FROM order_items WHERE order_id = v_order_id;

  IF v_total_paid >= v_order_total AND v_order_total > 0 THEN
    v_new_status := 'Paid';
  ELSIF v_total_paid > 0 THEN
    v_new_status := 'Partial';
  ELSE
    v_new_status := 'Pending';
  END IF;

  UPDATE orders
  SET paid_amount = v_total_paid,
      payment_status = v_new_status,
      updated_at = now()
  WHERE id = v_order_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER payments_sync_order
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION sync_order_paid_amount();

-- -----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (permissive for internal dashboard)
-- -----------------------------------------------------------------------------

ALTER TABLE customers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on customers"
  ON customers FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on vendors"
  ON vendors FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on orders"
  ON orders FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on order_items"
  ON order_items FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on payments"
  ON payments FOR ALL USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 8. SAMPLE DATA
-- -----------------------------------------------------------------------------

-- Customers
INSERT INTO customers (name, email, phone, address) VALUES
  ('Rajesh Kumar',              'rajesh@email.com',         '+91 98765 43210', 'Chennai'),
  ('Anita Sharma',              'anita@email.com',          '+91 98765 43211', 'Bangalore'),
  ('Vikram Enterprises',        'vikram@buildright.com',    '+91 98765 43212', 'Hyderabad'),
  ('Priya Menon',               'priya@email.com',          '+91 98765 43213', 'Kochi'),
  ('BuildRight Constructions',  'contact@buildright.com',   '+91 98765 43214', 'Mumbai');

-- Vendors
INSERT INTO vendors (name, contact_person, phone, email) VALUES
  ('Premium Woodcraft',        'Suresh',  '+91 90001 00001', 'sales@premiumwoodcraft.in'),
  ('Metro Hardware Co.',       'Ravi',    '+91 90001 00002', 'orders@metrohardware.in'),
  ('Elite Glass & Doors',      'Meera',   '+91 90001 00003', 'info@eliteglass.in'),
  ('Interior Solutions Ltd.',  'Arun',    '+91 90001 00004', 'arun@interiorsolutions.in'),
  ('Safety Doors India',       'Kiran',   '+91 90001 00005', 'kiran@safetydoors.in'),
  ('SecureEntry Systems',      'Deepak',  '+91 90001 00006', 'deepak@secureentry.in'),
  ('AluFrame Industries',      'Nisha',   '+91 90001 00007', 'nisha@aluframe.in'),
  ('AutoDoor Technologies',    'Vijay',   '+91 90001 00008', 'vijay@autodoor.in');

-- Orders (paid_amount will be recalculated when payments are inserted)
INSERT INTO orders (customer_id, order_number, project_name, payment_status, paid_amount)
SELECT id, 'DH-2026-1042', 'Green Valley Apartments — Block A', 'Partial', 0
FROM customers WHERE name = 'Rajesh Kumar';

INSERT INTO orders (customer_id, order_number, project_name, payment_status, paid_amount)
SELECT id, 'DH-2026-1038', 'Sunrise Villa — Phase 2', 'Paid', 0
FROM customers WHERE name = 'Anita Sharma';

INSERT INTO orders (customer_id, order_number, project_name, payment_status, paid_amount)
SELECT id, 'DH-2026-1035', 'Office Renovation — 3rd Floor', 'Pending', 0
FROM customers WHERE name = 'Vikram Enterprises';

INSERT INTO orders (customer_id, order_number, project_name, payment_status, paid_amount)
SELECT id, 'DH-2026-1029', 'Lakeview Residency — Unit 12B', 'Overdue', 0
FROM customers WHERE name = 'Priya Menon';

INSERT INTO orders (customer_id, order_number, project_name, payment_status, paid_amount)
SELECT id, 'DH-2026-1024', 'Commercial Plaza — Wing C', 'Partial', 0
FROM customers WHERE name = 'BuildRight Constructions';

-- Order items — DH-2026-1042 (Rajesh Kumar)
INSERT INTO order_items (order_id, vendor_id, name, status, amount)
SELECT o.id, v.id, 'Main Entrance Door — Teak', 'Installation Scheduled'::order_item_status, 95000
FROM orders o, vendors v
WHERE o.order_number = 'DH-2026-1042' AND v.name = 'Premium Woodcraft';

INSERT INTO order_items (order_id, vendor_id, name, status, amount)
SELECT o.id, v.id, 'Bedroom Doors (3) — Flush', 'Ready'::order_item_status, 72000
FROM orders o, vendors v
WHERE o.order_number = 'DH-2026-1042' AND v.name = 'Metro Hardware Co.';

INSERT INTO order_items (order_id, vendor_id, name, status, amount)
SELECT o.id, NULL, 'Bathroom Door — Waterproof', 'Measurement Pending'::order_item_status, 38000
FROM orders o WHERE o.order_number = 'DH-2026-1042';

-- Order items — DH-2026-1038 (Anita Sharma)
INSERT INTO order_items (order_id, vendor_id, name, status, amount)
SELECT o.id, v.id, 'French Door — Living Room', 'Completed'::order_item_status, 88000
FROM orders o, vendors v
WHERE o.order_number = 'DH-2026-1038' AND v.name = 'Elite Glass & Doors';

INSERT INTO order_items (order_id, vendor_id, name, status, amount)
SELECT o.id, v.id, 'Sliding Wardrobe Shutter', 'Installed'::order_item_status, 68000
FROM orders o, vendors v
WHERE o.order_number = 'DH-2026-1038' AND v.name = 'Interior Solutions Ltd.';

-- Order items — DH-2026-1035 (Vikram Enterprises)
INSERT INTO order_items (order_id, vendor_id, name, status, amount)
SELECT o.id, v.id, 'Fire-rated Door — Server Room', 'Vendor Assigned'::order_item_status, 125000
FROM orders o, vendors v
WHERE o.order_number = 'DH-2026-1035' AND v.name = 'Safety Doors India';

INSERT INTO order_items (order_id, vendor_id, name, status, amount)
SELECT o.id, v.id, 'Glass Partition Doors (4)', 'Vendor Assigned'::order_item_status, 187000
FROM orders o, vendors v
WHERE o.order_number = 'DH-2026-1035' AND v.name = 'Elite Glass & Doors';

INSERT INTO order_items (order_id, vendor_id, name, status, amount)
SELECT o.id, v.id, 'Cabinet Hardware Set', 'New'::order_item_status, 45000
FROM orders o, vendors v
WHERE o.order_number = 'DH-2026-1035' AND v.name = 'Metro Hardware Co.';

INSERT INTO order_items (order_id, vendor_id, name, status, amount)
SELECT o.id, NULL, 'Main Office Entrance', 'New'::order_item_status, 55000
FROM orders o WHERE o.order_number = 'DH-2026-1035';

-- Order items — DH-2026-1029 (Priya Menon)
INSERT INTO order_items (order_id, vendor_id, name, status, amount)
SELECT o.id, v.id, 'Main Door with Smart Lock', 'Ready'::order_item_status, 112000
FROM orders o, vendors v
WHERE o.order_number = 'DH-2026-1029' AND v.name = 'SecureEntry Systems';

INSERT INTO order_items (order_id, vendor_id, name, status, amount)
SELECT o.id, v.id, 'Balcony Door — Aluminium', 'Measurement Pending'::order_item_status, 86000
FROM orders o, vendors v
WHERE o.order_number = 'DH-2026-1029' AND v.name = 'AluFrame Industries';

-- Order items — DH-2026-1024 (BuildRight Constructions)
INSERT INTO order_items (order_id, vendor_id, name, status, amount)
SELECT o.id, v.id, 'Automatic Sliding Doors (2)', 'Installation Scheduled'::order_item_status, 340000
FROM orders o, vendors v
WHERE o.order_number = 'DH-2026-1024' AND v.name = 'AutoDoor Technologies';

INSERT INTO order_items (order_id, vendor_id, name, status, amount)
SELECT o.id, v.id, 'Revolving Entrance Assembly', 'Ready'::order_item_status, 550000
FROM orders o, vendors v
WHERE o.order_number = 'DH-2026-1024' AND v.name = 'AutoDoor Technologies';

-- Payments (trigger updates orders.paid_amount & payment_status)
INSERT INTO payments (order_id, amount, payment_date, method, notes)
SELECT o.id, 142500, '2026-05-20', 'Bank Transfer', '50% advance — Block A'
FROM orders o WHERE o.order_number = 'DH-2026-1042';

INSERT INTO payments (order_id, amount, payment_date, method, notes)
SELECT o.id, 156000, '2026-05-18', 'UPI', 'Full payment — Villa Phase 2'
FROM orders o WHERE o.order_number = 'DH-2026-1038';

INSERT INTO payments (order_id, amount, payment_date, method, notes)
SELECT o.id, 99000, '2026-04-10', 'Cheque', 'Partial — overdue balance pending'
FROM orders o WHERE o.order_number = 'DH-2026-1029';

INSERT INTO payments (order_id, amount, payment_date, method, notes)
SELECT o.id, 445000, '2026-05-01', 'Bank Transfer', '50% milestone — Wing C'
FROM orders o WHERE o.order_number = 'DH-2026-1024';

-- Manually set Overdue on Priya's order (partial pay, balance due past due)
UPDATE orders
SET payment_status = 'Overdue'
WHERE order_number = 'DH-2026-1029';

-- Advance order number sequence past seeded IDs
SELECT setval('order_number_seq', 1043);

-- -----------------------------------------------------------------------------
-- 9. ERP SETTINGS
-- -----------------------------------------------------------------------------

CREATE TABLE erp_settings (
  id                      TEXT PRIMARY KEY DEFAULT 'global',
  order_number_prefix     TEXT NOT NULL DEFAULT 'DH',
  order_number_format     TEXT NOT NULL DEFAULT '{PREFIX}-{YEAR}-{SEQ}',
  default_item_status     order_item_status NOT NULL DEFAULT 'New',
  default_payment_status  payment_status NOT NULL DEFAULT 'Pending',
  measurement_unit        TEXT NOT NULL DEFAULT 'mm',
  payment_terms           TEXT NOT NULL DEFAULT '50% advance, 50% on delivery',
  vendor_categories       JSONB NOT NULL DEFAULT '["Wood & Timber","Glass & Aluminium","Hardware","Fire Safety","Automation"]'::jsonb,
  supported_door_types    JSONB NOT NULL DEFAULT '["Flush Door","Teak Door","French Door","Sliding Door","Fire-rated Door","Smart Lock Door"]'::jsonb,
  order_stages            JSONB NOT NULL DEFAULT '[]'::jsonb,
  status_colors           JSONB NOT NULL DEFAULT '{}'::jsonb,
  company_name            TEXT NOT NULL DEFAULT 'DoorHub ERP',
  company_phone           TEXT,
  company_address         TEXT,
  gst_number              TEXT,
  dark_mode               BOOLEAN NOT NULL DEFAULT false,
  accent_color            TEXT NOT NULL DEFAULT '#f59e0b',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT erp_settings_singleton CHECK (id = 'global')
);

CREATE TRIGGER erp_settings_updated_at
  BEFORE UPDATE ON erp_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE erp_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on erp_settings" ON erp_settings FOR ALL USING (true) WITH CHECK (true);

INSERT INTO erp_settings (id, order_stages, status_colors) VALUES (
  'global',
  '[{"key":"New","label":"New","sort":1},{"key":"Measurement Pending","label":"Measurement Pending","sort":2},{"key":"Vendor Assigned","label":"Vendor Assigned","sort":3},{"key":"Ready","label":"Ready","sort":4},{"key":"Installation Scheduled","label":"Installation Scheduled","sort":5},{"key":"Installed","label":"Installed","sort":6},{"key":"Completed","label":"Completed","sort":7}]'::jsonb,
  '{"New":"#64748b","Measurement Pending":"#f59e0b","Vendor Assigned":"#3b82f6","Ready":"#10b981","Installation Scheduled":"#8b5cf6","Installed":"#06b6d4","Completed":"#16a34a"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 10. VERIFY (optional — returns row counts)
-- -----------------------------------------------------------------------------

SELECT 'customers'   AS table_name, COUNT(*) AS rows FROM customers
UNION ALL SELECT 'vendors',     COUNT(*) FROM vendors
UNION ALL SELECT 'orders',      COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'payments',    COUNT(*) FROM payments
UNION ALL SELECT 'erp_settings', COUNT(*) FROM erp_settings;

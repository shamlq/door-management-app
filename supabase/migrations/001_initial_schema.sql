-- Door & Hardware Order Management Schema

-- Enums
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

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vendors
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders (one customer → many orders)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  order_number TEXT NOT NULL UNIQUE,
  project_name TEXT NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'Pending',
  paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order items (one order → many items, each item → one vendor)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  status order_item_status NOT NULL DEFAULT 'New',
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments (one order → many payments)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_vendor_id ON order_items(vendor_id);
CREATE INDEX idx_order_items_status ON order_items(status);
CREATE INDEX idx_payments_order_id ON payments(order_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Order number sequence
CREATE SEQUENCE order_number_seq START WITH 1000;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'DH-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('order_number_seq')::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION generate_order_number() TO anon, authenticated;

-- Sync order paid_amount from payments
CREATE OR REPLACE FUNCTION sync_order_paid_amount()
RETURNS TRIGGER AS $$
DECLARE
  total_paid NUMERIC(12, 2);
  order_total NUMERIC(12, 2);
  new_status payment_status;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM payments WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);

  SELECT COALESCE(SUM(amount), 0) INTO order_total
  FROM order_items WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);

  IF order_total = 0 THEN
    SELECT 0 INTO order_total;
  END IF;

  IF total_paid >= order_total AND order_total > 0 THEN
    new_status := 'Paid';
  ELSIF total_paid > 0 THEN
    new_status := 'Partial';
  ELSE
    new_status := 'Pending';
  END IF;

  UPDATE orders
  SET paid_amount = total_paid, payment_status = new_status
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_sync_order
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION sync_order_paid_amount();

-- RLS (permissive for internal dashboard — tighten when adding auth)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on vendors" ON vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on payments" ON payments FOR ALL USING (true) WITH CHECK (true);

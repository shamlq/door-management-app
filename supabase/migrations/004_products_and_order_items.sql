-- Products module + order_items enhancements

CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  category      TEXT NOT NULL,
  base_price    NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (base_price >= 0),
  description   TEXT,
  active_status BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(active_status);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on products" ON products FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  ADD COLUMN IF NOT EXISTS width NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS height NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS depth NUMERIC(10, 2);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Sample products
INSERT INTO products (name, category, base_price, description, active_status) VALUES
  ('Main Entrance Door — Teak', 'Doors', 95000, 'Premium teak main door with frame', true),
  ('Bedroom Flush Door (Single)', 'Doors', 24000, 'Standard flush bedroom door', true),
  ('Bathroom Waterproof Door', 'Doors', 38000, 'Moisture-resistant bathroom door', true),
  ('French Door — Living Room', 'Doors', 88000, 'Double glass french door', true),
  ('Sliding Wardrobe Shutter', 'Wardrobe', 68000, 'Custom sliding shutter system', true),
  ('Fire-rated Server Room Door', 'Safety', 125000, '90-min fire rated door', true),
  ('Glass Partition Door', 'Glass', 46750, 'Single glass partition unit', true),
  ('Automatic Sliding Door', 'Automation', 170000, 'Commercial auto sliding door', true),
  ('Smart Lock Main Door Kit', 'Hardware', 45000, 'Biometric smart lock assembly', true),
  ('Aluminium Balcony Door', 'Aluminium', 86000, 'Powder-coated balcony door', true);
  
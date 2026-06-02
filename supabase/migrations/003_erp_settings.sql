-- ERP Settings (singleton row: id = 'global')

CREATE TABLE erp_settings (
  id                      TEXT PRIMARY KEY DEFAULT 'global',

  -- Order settings
  order_number_prefix     TEXT NOT NULL DEFAULT 'DH',
  order_number_format     TEXT NOT NULL DEFAULT '{PREFIX}-{YEAR}-{SEQ}',
  default_item_status     order_item_status NOT NULL DEFAULT 'New',
  default_payment_status  payment_status NOT NULL DEFAULT 'Pending',
  measurement_unit        TEXT NOT NULL DEFAULT 'mm',
  payment_terms           TEXT NOT NULL DEFAULT '50% advance, 50% on delivery',

  -- Vendor settings (JSON arrays)
  vendor_categories       JSONB NOT NULL DEFAULT '["Wood & Timber","Glass & Aluminium","Hardware","Fire Safety","Automation"]'::jsonb,
  supported_door_types    JSONB NOT NULL DEFAULT '["Flush Door","Teak Door","French Door","Sliding Door","Fire-rated Door","Smart Lock Door"]'::jsonb,

  -- Workflow settings
  order_stages            JSONB NOT NULL DEFAULT '[]'::jsonb,
  status_colors           JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Business settings
  company_name            TEXT NOT NULL DEFAULT 'DoorHub ERP',
  company_phone           TEXT,
  company_address         TEXT,
  gst_number              TEXT,

  -- Appearance settings
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

CREATE POLICY "Allow all on erp_settings"
  ON erp_settings FOR ALL USING (true) WITH CHECK (true);

INSERT INTO erp_settings (
  id,
  order_stages,
  status_colors
) VALUES (
  'global',
  '[
    {"key":"New","label":"New","sort":1},
    {"key":"Measurement Pending","label":"Measurement Pending","sort":2},
    {"key":"Vendor Assigned","label":"Vendor Assigned","sort":3},
    {"key":"Ready","label":"Ready","sort":4},
    {"key":"Installation Scheduled","label":"Installation Scheduled","sort":5},
    {"key":"Installed","label":"Installed","sort":6},
    {"key":"Completed","label":"Completed","sort":7}
  ]'::jsonb,
  '{
    "New":"#64748b",
    "Measurement Pending":"#f59e0b",
    "Vendor Assigned":"#3b82f6",
    "Ready":"#10b981",
    "Installation Scheduled":"#8b5cf6",
    "Installed":"#06b6d4",
    "Completed":"#16a34a"
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;

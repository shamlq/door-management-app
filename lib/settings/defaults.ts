import type { ErpSettings, OrderStage, StatusColors } from "./types";

export const DEFAULT_ORDER_STAGES: OrderStage[] = [
  { key: "New", label: "New", sort: 1 },
  { key: "Measurement Pending", label: "Measurement Pending", sort: 2 },
  { key: "Vendor Assigned", label: "Vendor Assigned", sort: 3 },
  { key: "Ready", label: "Ready", sort: 4 },
  { key: "Installation Scheduled", label: "Installation Scheduled", sort: 5 },
  { key: "Installed", label: "Installed", sort: 6 },
  { key: "Completed", label: "Completed", sort: 7 },
];

export const DEFAULT_STATUS_COLORS: StatusColors = {
  New: "#64748b",
  "Measurement Pending": "#f59e0b",
  "Vendor Assigned": "#3b82f6",
  Ready: "#10b981",
  "Installation Scheduled": "#8b5cf6",
  Installed: "#06b6d4",
  Completed: "#16a34a",
};

export const DEFAULT_ERP_SETTINGS: ErpSettings = {
  id: "global",
  order_number_prefix: "DH",
  order_number_format: "{PREFIX}-{YEAR}-{SEQ}",
  default_item_status: "New",
  default_payment_status: "Pending",
  measurement_unit: "mm",
  payment_terms: "50% advance, 50% on delivery",
  vendor_categories: [
    "Wood & Timber",
    "Glass & Aluminium",
    "Hardware",
    "Fire Safety",
    "Automation",
  ],
  supported_door_types: [
    "Flush Door",
    "Teak Door",
    "French Door",
    "Sliding Door",
    "Fire-rated Door",
    "Smart Lock Door",
  ],
  order_stages: DEFAULT_ORDER_STAGES,
  status_colors: DEFAULT_STATUS_COLORS,
  company_name: "DoorHub ERP",
  company_phone: null,
  company_address: null,
  gst_number: null,
  dark_mode: false,
  accent_color: "#f59e0b",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

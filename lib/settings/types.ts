import type { OrderItemStatus, PaymentStatus } from "@/lib/supabase/database.types";

export type MeasurementUnit = "mm" | "cm" | "inch" | "ft";

export type OrderStage = {
  key: OrderItemStatus;
  label: string;
  sort: number;
};

export type StatusColors = Partial<Record<OrderItemStatus, string>>;

export type ErpSettings = {
  id: string;
  order_number_prefix: string;
  order_number_format: string;
  default_item_status: OrderItemStatus;
  default_payment_status: PaymentStatus;
  measurement_unit: MeasurementUnit;
  payment_terms: string;
  vendor_categories: string[];
  supported_door_types: string[];
  order_stages: OrderStage[];
  status_colors: StatusColors;
  company_name: string;
  company_phone: string | null;
  company_address: string | null;
  gst_number: string | null;
  dark_mode: boolean;
  accent_color: string;
  created_at: string;
  updated_at: string;
};

export type SettingsSection =
  | "order"
  | "vendor"
  | "workflow"
  | "business"
  | "appearance";

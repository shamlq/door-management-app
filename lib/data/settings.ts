import { createClient } from "@/lib/supabase/server";
import { canQueryDatabase } from "@/lib/data/safe-query";
import { DEFAULT_ERP_SETTINGS } from "@/lib/settings/defaults";
import type {
  ErpSettings,
  MeasurementUnit,
  OrderStage,
  StatusColors,
} from "@/lib/settings/types";
import type { OrderItemStatus } from "@/lib/supabase/database.types";

type SettingsRow = {
  id: string;
  order_number_prefix: string;
  order_number_format: string;
  default_item_status: OrderItemStatus;
  default_payment_status: ErpSettings["default_payment_status"];
  measurement_unit: string;
  payment_terms: string;
  vendor_categories: unknown;
  supported_door_types: unknown;
  order_stages: unknown;
  status_colors: unknown;
  company_name: string;
  company_phone: string | null;
  company_address: string | null;
  gst_number: string | null;
  dark_mode: boolean;
  accent_color: string;
  created_at: string;
  updated_at: string;
};

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string");
  }
  return [];
}

function parseOrderStages(value: unknown): OrderStage[] {
  if (!Array.isArray(value)) return DEFAULT_ERP_SETTINGS.order_stages;
  return value
    .filter(
      (s): s is OrderStage =>
        typeof s === "object" &&
        s !== null &&
        "key" in s &&
        "label" in s &&
        typeof (s as OrderStage).key === "string"
    )
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
}

function parseStatusColors(value: unknown): StatusColors {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as StatusColors;
  }
  return DEFAULT_ERP_SETTINGS.status_colors;
}

function mapRow(row: SettingsRow): ErpSettings {
  return {
    id: row.id,
    order_number_prefix: row.order_number_prefix,
    order_number_format: row.order_number_format,
    default_item_status: row.default_item_status,
    default_payment_status: row.default_payment_status,
    measurement_unit: row.measurement_unit as MeasurementUnit,
    payment_terms: row.payment_terms,
    vendor_categories: parseStringArray(row.vendor_categories),
    supported_door_types: parseStringArray(row.supported_door_types),
    order_stages: parseOrderStages(row.order_stages),
    status_colors: parseStatusColors(row.status_colors),
    company_name: row.company_name,
    company_phone: row.company_phone,
    company_address: row.company_address,
    gst_number: row.gst_number,
    dark_mode: row.dark_mode,
    accent_color: row.accent_color,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getErpSettings(): Promise<ErpSettings> {
  if (!(await canQueryDatabase())) return DEFAULT_ERP_SETTINGS;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("erp_settings")
    .select("*")
    .eq("id", "global")
    .maybeSingle();

  if (error || !data) return DEFAULT_ERP_SETTINGS;
  return mapRow(data as SettingsRow);
}

export async function ensureErpSettingsRow(): Promise<void> {
  if (!(await canQueryDatabase())) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from("erp_settings")
    .select("id")
    .eq("id", "global")
    .maybeSingle();

  if (!data) {
    await supabase.from("erp_settings").insert({
      id: "global",
      order_stages: DEFAULT_ERP_SETTINGS.order_stages,
      status_colors: DEFAULT_ERP_SETTINGS.status_colors,
      vendor_categories: DEFAULT_ERP_SETTINGS.vendor_categories,
      supported_door_types: DEFAULT_ERP_SETTINGS.supported_door_types,
    });
  }
}

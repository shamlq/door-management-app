"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ensureErpSettingsRow } from "@/lib/data/settings";
import { DEFAULT_ORDER_STAGES } from "@/lib/settings/defaults";
import { ORDER_ITEM_STATUSES } from "@/lib/status-config";
import type { ActionResult } from "./customers";
import type { OrderItemStatus, PaymentStatus } from "@/lib/supabase/database.types";

const PAYMENT_STATUSES: PaymentStatus[] = ["Paid", "Partial", "Pending", "Overdue"];
const MEASUREMENT_UNITS = ["mm", "cm", "inch", "ft"] as const;

function linesToJsonArray(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function upsertSettings(patch: Record<string, unknown>): Promise<ActionResult> {
  await ensureErpSettingsRow();
  const supabase = await createClient();
  const { error } = await supabase
    .from("erp_settings")
    .upsert({ id: "global", ...patch }, { onConflict: "id" });

  if (error) return { success: false, error: error.message };

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateOrderSettings(formData: FormData): Promise<ActionResult> {
  const defaultItemStatus = formData.get("default_item_status")?.toString() as OrderItemStatus;
  const defaultPaymentStatus = formData.get("default_payment_status")?.toString() as PaymentStatus;
  const measurementUnit = formData.get("measurement_unit")?.toString();

  if (!ORDER_ITEM_STATUSES.includes(defaultItemStatus)) {
    return { success: false, error: "Invalid default item status" };
  }
  if (!PAYMENT_STATUSES.includes(defaultPaymentStatus)) {
    return { success: false, error: "Invalid default payment status" };
  }
  if (!measurementUnit || !MEASUREMENT_UNITS.includes(measurementUnit as (typeof MEASUREMENT_UNITS)[number])) {
    return { success: false, error: "Invalid measurement unit" };
  }

  return upsertSettings({
    order_number_prefix: formData.get("order_number_prefix")?.toString().trim() || "DH",
    order_number_format:
      formData.get("order_number_format")?.toString().trim() || "{PREFIX}-{YEAR}-{SEQ}",
    default_item_status: defaultItemStatus,
    default_payment_status: defaultPaymentStatus,
    measurement_unit: measurementUnit,
    payment_terms: formData.get("payment_terms")?.toString().trim() || "",
  });
}

export async function updateVendorSettings(formData: FormData): Promise<ActionResult> {
  const categories = linesToJsonArray(formData.get("vendor_categories")?.toString());
  const doorTypes = linesToJsonArray(formData.get("supported_door_types")?.toString());

  if (categories.length === 0) {
    return { success: false, error: "Add at least one vendor category" };
  }
  if (doorTypes.length === 0) {
    return { success: false, error: "Add at least one door type" };
  }

  return upsertSettings({
    vendor_categories: categories,
    supported_door_types: doorTypes,
  });
}

export async function updateWorkflowSettings(formData: FormData): Promise<ActionResult> {
  const stages = DEFAULT_ORDER_STAGES.map((stage, index) => {
    const label =
      formData.get(`stage_label_${stage.key}`)?.toString().trim() || stage.label;
    const color =
      formData.get(`stage_color_${stage.key}`)?.toString().trim() ||
      "#64748b";
    return {
      key: stage.key,
      label,
      sort: index + 1,
    };
  });

  const statusColors = Object.fromEntries(
    ORDER_ITEM_STATUSES.map((key) => [
      key,
      formData.get(`stage_color_${key}`)?.toString().trim() || "#64748b",
    ])
  );

  return upsertSettings({
    order_stages: stages,
    status_colors: statusColors,
  });
}

export async function updateBusinessSettings(formData: FormData): Promise<ActionResult> {
  const companyName = formData.get("company_name")?.toString().trim();
  if (!companyName) return { success: false, error: "Company name is required" };

  return upsertSettings({
    company_name: companyName,
    company_phone: formData.get("company_phone")?.toString().trim() || null,
    company_address: formData.get("company_address")?.toString().trim() || null,
    gst_number: formData.get("gst_number")?.toString().trim() || null,
  });
}

export async function updateAppearanceSettings(formData: FormData): Promise<ActionResult> {
  const darkMode = formData.get("dark_mode") === "on" || formData.get("dark_mode") === "true";
  const accentColor = formData.get("accent_color")?.toString().trim() || "#f59e0b";

  const result = await upsertSettings({
    dark_mode: darkMode,
    accent_color: accentColor,
  });

  if (result.success) {
    const cookieStore = await cookies();
    cookieStore.set("doorhub_dark_mode", darkMode ? "1" : "0", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    cookieStore.set("doorhub_accent", accentColor, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return result;
}

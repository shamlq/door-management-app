import { createClient } from "@/lib/supabase/server";
import { canQueryDatabase } from "@/lib/data/safe-query";
import type {
  DashboardStats,
  Order,
  OrderItem,
  PaymentSummary,
} from "@/lib/types";
import type {
  Customer,
  DbPayment,
  OrderItemStatus,
  PaymentStatus,
  Vendor,
} from "@/lib/supabase/database.types";

type OrderItemRow = {
  id: string;
  name: string;
  product_id: string | null;
  vendor_id: string | null;
  status: OrderItemStatus;
  quantity: number;
  unit_price: number;
  amount: number;
  width: number | null;
  height: number | null;
  depth: number | null;
  vendors: { id: string; name: string } | null;
  products: { id: string; name: string; category: string } | null;
};

type OrderRow = {
  id: string;
  order_number: string;
  project_name: string;
  payment_status: PaymentStatus;
  paid_amount: number;
  created_at: string;
  customer_id: string;
  customers: { name: string } | null;
  order_items: OrderItemRow[];
};

function mapOrderItem(item: OrderItemRow): OrderItem {
  return {
    id: item.id,
    name: item.products?.name ?? item.name,
    productId: item.product_id,
    productCategory: item.products?.category ?? null,
    vendorId: item.vendor_id,
    vendor: item.vendors?.name ?? null,
    status: item.status,
    quantity: Number(item.quantity ?? 1),
    unitPrice: Number(item.unit_price ?? item.amount),
    amount: Number(item.amount),
    width: item.width != null ? Number(item.width) : null,
    height: item.height != null ? Number(item.height) : null,
    depth: item.depth != null ? Number(item.depth) : null,
  };
}

function mapOrder(row: OrderRow): Order {
  const items = (row.order_items ?? []).map(mapOrderItem);
  const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);

  return {
    id: row.id,
    orderNumber: row.order_number,
    customer: row.customers?.name ?? "Unknown",
    customerId: row.customer_id,
    project: row.project_name,
    createdAt: row.created_at.split("T")[0],
    items,
    totalAmount,
    paidAmount: Number(row.paid_amount),
    paymentStatus: row.payment_status,
  };
}

export const ORDER_SELECT = `
  id,
  order_number,
  project_name,
  payment_status,
  paid_amount,
  created_at,
  customer_id,
  customers ( name ),
  order_items (
    id,
    name,
    product_id,
    vendor_id,
    status,
    quantity,
    unit_price,
    amount,
    width,
    height,
    depth,
    vendors ( id, name ),
    products ( id, name, category )
  )
`;

export async function getRecentOrders(limit = 10): Promise<Order[]> {
  if (!(await canQueryDatabase())) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data as OrderRow[]).map(mapOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (!(await canQueryDatabase())) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .single();

  if (error) return null;
  return mapOrder(data as OrderRow);
}

export async function getAllOrders(): Promise<Order[]> {
  if (!(await canQueryDatabase())) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as OrderRow[]).map(mapOrder);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const empty: DashboardStats = {
    totalOrders: 0,
    measurementPending: 0,
    underProduction: 0,
    ready: 0,
    installationScheduled: 0,
    installed: 0,
    completed: 0,
    paymentPending: 0,
    pendingCollection: 0,
  };

  if (!(await canQueryDatabase())) return empty;

  const supabase = await createClient();

  const [ordersRes, itemsRes, pendingOrdersRes] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("order_items").select("status, amount"),
    supabase
      .from("orders")
      .select("id, payment_status")
      .in("payment_status", ["Pending", "Partial", "Overdue"]),
  ]);

  if (ordersRes.error) throw new Error(ordersRes.error.message);
  if (itemsRes.error) throw new Error(itemsRes.error.message);

  const items = itemsRes.data ?? [];
  const countByStatus = (status: OrderItemStatus) =>
    items.filter((i) => i.status === status).length;

  const totalItemAmount = items.reduce((s, i) => s + Number(i.amount), 0);

  const { data: ordersWithPaid } = await supabase
    .from("orders")
    .select("paid_amount");

  const totalPaid = (ordersWithPaid ?? []).reduce(
    (s, o) => s + Number(o.paid_amount),
    0
  );

  return {
    totalOrders: ordersRes.count ?? 0,
    measurementPending: countByStatus("Measurement Pending"),
    underProduction: countByStatus("Vendor Assigned"),
    ready: countByStatus("Ready"),
    installationScheduled: countByStatus("Installation Scheduled"),
    installed: countByStatus("Installed"),
    completed: countByStatus("Completed"),
    paymentPending: pendingOrdersRes.data?.length ?? 0,
    pendingCollection: Math.max(0, totalItemAmount - totalPaid),
  };
}

export async function getPaymentSummary(): Promise<PaymentSummary> {
  const empty: PaymentSummary = {
    totalRevenue: 0,
    collected: 0,
    pending: 0,
    overdue: 0,
    partialPayments: 0,
  };

  if (!(await canQueryDatabase())) return empty;

  const supabase = await createClient();

  const [itemsRes, ordersRes, paymentsRes] = await Promise.all([
    supabase.from("order_items").select("amount"),
    supabase.from("orders").select("payment_status, paid_amount"),
    supabase.from("payments").select("amount"),
  ]);

  if (itemsRes.error) throw new Error(itemsRes.error.message);
  if (ordersRes.error) throw new Error(ordersRes.error.message);

  const totalRevenue = (itemsRes.data ?? []).reduce(
    (s, i) => s + Number(i.amount),
    0
  );
  const collected = (paymentsRes.data ?? []).reduce(
    (s, p) => s + Number(p.amount),
    0
  );
  const orders = ordersRes.data ?? [];
  const overdue = orders
    .filter((o) => o.payment_status === "Overdue")
    .reduce((s, o) => s + Number(o.paid_amount), 0);

  return {
    totalRevenue,
    collected,
    pending: Math.max(0, totalRevenue - collected),
    overdue,
    partialPayments: orders.filter((o) => o.payment_status === "Partial").length,
  };
}

export async function getCustomers(): Promise<Customer[]> {
  if (!(await canQueryDatabase())) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

export async function getVendors(): Promise<Vendor[]> {
  if (!(await canQueryDatabase())) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

export async function getPaymentsForOrder(orderId: string): Promise<DbPayment[]> {
  if (!(await canQueryDatabase())) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .order("payment_date", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

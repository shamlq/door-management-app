import type { OrderItemStatus, PaymentStatus } from "@/lib/supabase/database.types";

export type { OrderItemStatus, PaymentStatus };

export interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  description: string | null;
  activeStatus: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  productId: string | null;
  productCategory: string | null;
  vendorId: string | null;
  vendor: string | null;
  status: OrderItemStatus;
  quantity: number;
  unitPrice: number;
  amount: number;
  width: number | null;
  height: number | null;
  depth: number | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  customerId: string;
  project: string;
  createdAt: string;
  items: OrderItem[];
  totalAmount: number;
  paidAmount: number;
  discountAmount: number;
  paymentStatus: PaymentStatus;
}

export interface DashboardStats {
  totalOrders: number;
  completedOrders: number;
  ordersInProgress: number;

  measurementPending: number;
  vendorAssignmentPending: number;
  inProduction: number;
  receivedAtVLocks: number;
  installationPending: number;

  paymentPending: number;

  totalOrderValue: number;
  collectionsReceived: number;
  outstandingAmount: number;
}

export interface PaymentSummary {
  totalRevenue: number;
  collected: number;
  pending: number;
  overdue: number;
  partialPayments: number;
}

export type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export type OrderLineInput = {
  productId: string;
  vendorId?: string | null;
  quantity?: number;
  unitPrice?: number;
  width?: number | null;
  height?: number | null;
  depth?: number | null;
};

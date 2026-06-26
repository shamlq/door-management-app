import type { OrderItemStatus, PaymentStatus } from "./types";

export const ORDER_ITEM_STATUSES: OrderItemStatus[] = [
  "New",
  "Measurement Pending",
  "Vendor Assignment Pending",
  "In Production",
  "Received at Shop",
  "Delivered at Site",
  "Installation Pending",
  "Completed",
  "Cancelled",
];

type StatusStyle = {
  bg: string;
  text: string;
  dot: string;
};

export const itemStatusStyles: Record<OrderItemStatus, StatusStyle> = {
  New: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    dot: "bg-slate-400",
  },

  "Measurement Pending": {
    bg: "bg-amber-50",
    text: "text-amber-800",
    dot: "bg-amber-500",
  },

"Vendor Assignment Pending": {
  bg: "bg-orange-50",
  text: "text-orange-800",
  dot: "bg-orange-500",
},

"In Production": {
  bg: "bg-indigo-50",
  text: "text-indigo-800",
  dot: "bg-indigo-500",
},

"Received at Shop": {
  bg: "bg-cyan-50",
  text: "text-cyan-800",
  dot: "bg-cyan-500",
},

"Delivered at Site": {
  bg: "bg-teal-50",
  text: "text-teal-800",
  dot: "bg-teal-500",
},

"Installation Pending": {
  bg: "bg-violet-50",
  text: "text-violet-800",
  dot: "bg-violet-500",
},

Cancelled: {
  bg: "bg-red-50",
  text: "text-red-800",
  dot: "bg-red-500",
},
  
  Completed: {
    bg: "bg-green-50",
    text: "text-green-800",
    dot: "bg-green-600",
  },
  
};

export const paymentStatusStyles: Record<PaymentStatus, StatusStyle> = {
  Paid: { bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-500" },
  Partial: { bg: "bg-amber-50", text: "text-amber-800", dot: "bg-amber-500" },
  Pending: { bg: "bg-orange-50", text: "text-orange-800", dot: "bg-orange-500" },
  Overdue: { bg: "bg-red-50", text: "text-red-800", dot: "bg-red-500" },
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

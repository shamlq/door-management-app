import {
  itemStatusStyles,
  paymentStatusStyles,
} from "@/lib/status-config";
import type { OrderItemStatus, PaymentStatus } from "@/lib/types";

type StatusBadgeProps = {
  status: OrderItemStatus | PaymentStatus | string;
  variant?: "item" | "payment";
  size?: "sm" | "md";
};

export function StatusBadge({
  status,
  variant = "item",
  size = "sm",
}: StatusBadgeProps) {
  const styles =
    variant === "payment"
      ? paymentStatusStyles[status as PaymentStatus]
      : itemStatusStyles[status as OrderItemStatus];

  const fallback = {
    bg: "bg-slate-100",
    text: "text-slate-700",
    dot: "bg-slate-400",
  };

  const { bg, text, dot } = styles ?? fallback;

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-xs gap-1"
      : "px-2.5 py-1 text-sm gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full whitespace-nowrap ${bg} ${text} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      {status}
    </span>
  );
}

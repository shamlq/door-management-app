import { notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { OrderDetailClient } from "@/components/orders/order-detail-client";
import { SupabaseBanner } from "@/components/ui/supabase-banner";
import {
  getOrderById,
  getPaymentsForOrder,
  getVendors,
  getOrderAttachments,
} from "@/lib/data/queries";
import { getErpSettings } from "@/lib/data/settings";
import { canQueryDatabase } from "@/lib/data/safe-query";
import { OrderAttachments } from "@/components/orders/order-attachments";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const ready = await canQueryDatabase();

  if (!ready) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-5xl space-y-4">
          <SupabaseBanner />
        </div>
      </DashboardLayout>
    );
  }

  const [
  order,
  vendors,
  payments,
  settings,
  attachments,
] = await Promise.all([
  getOrderById(id),
  getVendors(),
  getPaymentsForOrder(id),
  getErpSettings(),
  getOrderAttachments(id),
]);

  if (!order) notFound();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <SupabaseBanner />
        <>
  <OrderDetailClient
    order={order}
    vendors={vendors}
    payments={payments}
    defaultItemStatus={settings.default_item_status}
  />

  <OrderAttachments
  orderId={order.id}
  attachments={attachments}
/>
</>
      </div>
    </DashboardLayout>
  );
}

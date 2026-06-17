import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  getCustomerById,
  getOrdersByCustomerId,
} from "@/lib/data/queries";
import Link from "next/link";


type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CustomerDetailPage({
  params,
}: Props) {
  const { id } = await params;

const customer = await getCustomerById(id);
const orders = await getOrdersByCustomerId(id);

const totalRevenue = orders.reduce(
  (sum, order) => sum + order.totalAmount,
  0
);

const totalPaid = orders.reduce(
  (sum, order) =>
    sum + order.paidAmount + order.discountAmount,
  0
);

const totalOutstanding =
  totalRevenue - totalPaid;

const lastOrderDate =
  orders.length > 0
    ? orders
        .map((o) => new Date(o.createdAt))
        .sort((a, b) => b.getTime() - a.getTime())[0]
    : null;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-xl font-semibold">
          Customer Details
        </h1>

        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-center justify-between">
  <h2 className="text-lg font-semibold">
    {customer?.name}
  </h2>

  <Link
    href={`/customers/${id}/edit`}
    className="rounded border px-3 py-1 text-sm hover:bg-slate-50"
  >
    Edit Customer
  </Link>
</div>

<div className="mt-3 space-y-2 text-sm">
  <p>Email: {customer?.email ?? "-"}</p>
  <p>Phone: {customer?.phone ?? "-"}</p>
  <p>Address: {customer?.address ?? "-"}</p>
</div>
<div className="mt-6 grid grid-cols-5 gap-4">
  <div className="rounded-lg border p-4">
    <p className="text-xs text-slate-500">
      Total Orders
    </p>
    <p className="text-xl font-bold">
      {orders.length}
    </p>
  </div>

  <div className="rounded-lg border p-4">
    <p className="text-xs text-slate-500">
      Revenue
    </p>
    <p className="text-xl font-bold text-green-600">
      ₹{totalRevenue.toLocaleString("en-IN")}
    </p>
  </div>
<div className="rounded-lg border p-4">
  <p className="text-xs text-slate-500">
    Paid
  </p>
  <p className="text-xl font-bold text-blue-600">
    ₹{totalPaid.toLocaleString("en-IN")}
  </p>
</div>
  <div className="rounded-lg border p-4">
    <p className="text-xs text-slate-500">
      Outstanding
    </p>
    <p className="text-xl font-bold text-red-600">
      ₹{totalOutstanding.toLocaleString("en-IN")}
    </p>
  </div>
  <div className="rounded-lg border p-4">
  <p className="text-xs text-slate-500">
    Last Order
  </p>

  <p className="text-sm font-bold">
    {lastOrderDate
      ? lastOrderDate.toLocaleDateString("en-GB")
      : "-"}
  </p>
</div>
</div>

<section className="mt-8">
  <h3 className="text-lg font-semibold mb-4">
    Orders ({orders.length})
  </h3>

  <div className="space-y-3">
  {orders.map((order) => (
    <Link
  key={order.id}
  href={`/orders/${order.id}`}
  className="block rounded-lg border p-4 hover:bg-slate-50 transition"
>
      <div className="flex items-start justify-between">
        <div>
  <span className="font-semibold">
    {order.orderNumber}
  </span>

  <p className="text-sm text-slate-600">
    {order.project}
  </p>

  <p className="text-xs text-slate-400 mt-1">
    Order Date: {new Date(order.createdAt).toLocaleDateString("en-GB")}
  </p>
</div>

        <span
  className={`rounded-full px-3 py-1 text-xs font-semibold ${
    order.paymentStatus === "Paid"
      ? "bg-green-100 text-green-700"
      : order.paymentStatus === "Partial"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700"
  }`}
>
  {order.paymentStatus}
</span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-slate-500">
            Order Value
          </p>
          <p className="font-semibold">
            ₹{order.totalAmount.toLocaleString("en-IN")}
          </p>
        </div>

        <div>
  <p className="text-slate-500">
    Paid
  </p>
  <p className="font-semibold text-green-600">
    ₹{order.paidAmount.toLocaleString("en-IN")}
  </p>
</div>

<div>
  <p className="text-slate-500">
    Discount
  </p>
  <p className="font-semibold text-blue-600">
    ₹{order.discountAmount.toLocaleString("en-IN")}
  </p>
</div>

        <div>
          <p className="text-slate-500">
            Outstanding
          </p>
          <p className="font-semibold text-red-600">
            ₹{(
              order.totalAmount -
order.paidAmount -
order.discountAmount
            ).toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </Link>
  ))}
</div>
</section>
        </div>
      </div>
    </DashboardLayout>
  );
}
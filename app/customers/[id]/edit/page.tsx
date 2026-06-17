import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getCustomerById } from "@/lib/data/queries";
import { updateCustomer } from "@/lib/actions/customers";
import Link from "next/link";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCustomerPage({
  params,
}: Props) {
  const { id } = await params;

  const customer = await getCustomerById(id);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-xl font-semibold">
          Edit Customer
        </h1>

        <form
  action={async (formData) => {
    "use server";
    await updateCustomer(id, formData);
  }}
  className="space-y-4 rounded-2xl border bg-white p-6"
>
          <label className="block">
            <span className="text-xs font-medium">
              Name
            </span>
            <input
  name="name"
  defaultValue={customer?.name ?? ""}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium">
              Email
            </span>
            <input
  name="email"
  defaultValue={customer?.email ?? ""}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium">
              Phone
            </span>
            <input
  name="phone"
  defaultValue={customer?.phone ?? ""}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium">
              Address
            </span>
            <input
  name="address"
  defaultValue={customer?.address ?? ""}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </label>

          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Save Changes
          </button>
          <Link
  href={`/customers/${id}`}
  className="ml-3 rounded border px-4 py-2"
>
  Cancel
</Link>
        </form>
      </div>
    </DashboardLayout>
  );
}
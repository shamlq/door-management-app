import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getUsers } from "@/lib/data/queries";
import { UserForm } from "../../components/forms/user-form";
import Link from "next/link";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { disableUser, enableUser } from "./actions";



export default async function UsersPage() {
  const users = await getUsers();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Users
          </h1>
          <p className="text-sm text-slate-500">
            Manage system users
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[400px_1fr]">

  <UserForm />

  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              All Users ({users.length})
            </h2>
          </div>

          {users.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-500">
              No users found.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-sm">
                 <th className="p-4">Name</th>
<th className="p-4">Email</th>
<th className="p-4 text-center">Admin</th>
<th className="p-4 text-center">Active</th>
<th className="p-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b"
                  >
                    <td className="p-4 whitespace-nowrap">{user.name}</td>

<td className="p-4 whitespace-nowrap">{user.email}</td>

<td className="p-4 text-center">
  {user.is_admin ? (
    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
      Admin
    </span>
  ) : (
    "-"
  )}
</td>
<td className="p-4 text-center">
  {user.is_active ? (
    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
      Active
    </span>
  ) : (
    <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
      Inactive
    </span>
  )}
</td>
<td className="p-4 text-center">
  <div className="flex items-center justify-center gap-1">
    <Link
      href={`/users/${user.id}`}
      className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
    >
      Edit
    </Link>

    {user.is_active ? (
      <form
        action={async () => {
          "use server";
          await disableUser(user.id);
        }}
      >
        <ConfirmSubmitButton
  label="Disable"
  message="Are you sure you want to disable this user?"
  className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
/>
      </form>
    ) : (
      <form
        action={async () => {
          "use server";
          await enableUser(user.id);
        }}
      >
        <ConfirmSubmitButton
  label="Enable"
  message="Are you sure you want to enable this user?"
  className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
/>
      </form>
    )}
  </div>
</td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
      </div>
    </DashboardLayout>
  );
}
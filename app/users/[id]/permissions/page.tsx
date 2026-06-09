import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PermissionsForm } from "@/components/users/permissions-form";
import {
  getAllPermissions,
  getUserPermissionIds,
} from "@/lib/data/queries";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UserPermissionsPage({
  params,
}: Props) {
  const { id } = await params;

  const permissions = await getAllPermissions();
  const userPermissions = await getUserPermissionIds(id);

  console.log("PERMISSIONS:", permissions);
console.log("USER PERMISSIONS:", userPermissions);

  const assignedIds = new Set(
    userPermissions.map((p) => p.permission_id)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            User Permissions
          </h1>
          <p className="text-sm text-slate-500">
            Manage permissions for this user
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <PermissionsForm
    userId={id}
    permissions={permissions}
    assignedPermissionIds={Array.from(assignedIds)}
  />
</div>
      </div>
    </DashboardLayout>
  );
}
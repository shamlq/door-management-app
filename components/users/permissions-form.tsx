"use client";

import { useState } from "react";
import { updateUserPermissions } from "@/app/users/[id]/permissions/actions";

type Permission = {
  id: string;
  permission_key: string;
};

type Props = {
  userId: string;
  permissions: Permission[];
  assignedPermissionIds: string[];
};

export function PermissionsForm({
  userId,
  permissions,
  assignedPermissionIds,
}: Props) {
  const [selected, setSelected] = useState(
    new Set(assignedPermissionIds)
  );

  const toggle = (permissionId: string) => {
    const next = new Set(selected);

    if (next.has(permissionId)) {
      next.delete(permissionId);
    } else {
      next.add(permissionId);
    }

    setSelected(next);
  };


  const grouped = permissions.reduce((acc, permission) => {
  const [module, action] = permission.permission_key.split(".");

  if (!acc[module]) {
    acc[module] = {};
  }

  acc[module][action] = permission;

  return acc;
}, {} as Record<string, Record<string, typeof permissions[number]>>);

const moduleOrder = [
  "customers",
  "products",
  "orders",
  "vendors",
  "payments",
  "reports",
  "users",
];
  return (
    <form
      action={async () => {
        await updateUserPermissions(
          userId,
          Array.from(selected)
        );
      }}
      className="space-y-4"
    >
      <div className="overflow-x-auto">
  <table className="w-full border-collapse text-sm">
    <thead>
      <tr className="border-b bg-slate-50">
        <th className="p-3 text-left">Module</th>
        <th className="p-3 text-center">View</th>
        <th className="p-3 text-center">Create</th>
        <th className="p-3 text-center">Edit</th>
        <th className="p-3 text-center">Delete</th>
        <th className="p-3 text-center">Disable</th>
      </tr>
    </thead>

    <tbody>
      {Object.entries(grouped).map(([module, actions]) => (
        <tr key={module} className="border-b">
          <td className="p-3 font-medium capitalize">
            {module}
          </td>

          {["view", "create", "edit", "delete", "disable"].map(
            (action) => {
              const permission =
                actions[action as keyof typeof actions];

              return (
                <td
                  key={action}
                  className="p-3 text-center"
                >
                  {permission ? (
                    <input
                      type="checkbox"
                      checked={selected.has(permission.id)}
                      onChange={() => toggle(permission.id)}
                    />
                  ) : (
                    "-"
                  )}
                </td>
              );
            }
          )}
        </tr>
      ))}
    </tbody>
  </table>
</div>

      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Save Permissions
      </button>
    </form>
  );
}
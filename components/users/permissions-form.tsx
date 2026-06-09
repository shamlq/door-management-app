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
      <div className="grid gap-2">
        {permissions.map((permission) => (
          <label
            key={permission.id}
            className="flex items-center gap-3"
          >
            <input
              type="checkbox"
              checked={selected.has(permission.id)}
              onChange={() => toggle(permission.id)}
            />
            <span>{permission.permission_key}</span>
          </label>
        ))}
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
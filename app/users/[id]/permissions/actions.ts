"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserPermissions(
  userId: string,
  permissionIds: string[]
) {
 

  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("user_permissions")
    .delete()
    .eq("user_id", userId);

  

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (permissionIds.length > 0) {
    const rows = permissionIds.map((permissionId) => ({
      user_id: userId,
      permission_id: permissionId,
    }));

    const { error: insertError } = await supabase
      .from("user_permissions")
      .insert(rows);

    

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  revalidatePath(`/users/${userId}/permissions`);
}
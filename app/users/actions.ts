"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function disableUser(userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("users")
    .update({
      is_active: false,
    })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/users");
}

export async function enableUser(userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("users")
    .update({
      is_active: true,
    })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/users");
}
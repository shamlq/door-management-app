"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadOrderAttachment(
  orderId: string,
  formData: FormData
) {
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    throw new Error("No file selected");
  }

  const supabase = await createClient();

  const filePath =
    `${orderId}/${Date.now()}-${file.name}`;

  const { error: uploadError } =
    await supabase.storage
      .from("order-attachments")
      .upload(filePath, file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: dbError } =
    await supabase
      .from("order_attachments")
      .insert({
        order_id: orderId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
      });

  if (dbError) {
    throw new Error(dbError.message);
  }

  return {
    success: true,
  };
}

export async function getAttachmentUrl(
  filePath: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from("order-attachments")
    .createSignedUrl(
      filePath,
      60 * 60
    );

  if (error) {
    throw new Error(error.message);
  }

  return data.signedUrl;
}

export async function deleteOrderAttachment(
  attachmentId: string,
  filePath: string
) {
  const supabase = await createClient();

  const { error: storageError } =
    await supabase.storage
      .from("order-attachments")
      .remove([filePath]);

  if (storageError) {
    throw new Error(storageError.message);
  }

  const { error: dbError } =
    await supabase
      .from("order_attachments")
      .delete()
      .eq("id", attachmentId);

  if (dbError) {
    throw new Error(dbError.message);
  }

  return {
    success: true,
  };
}
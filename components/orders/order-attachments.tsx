"use client";

import { useState } from "react";
import {
  uploadOrderAttachment,
  getAttachmentUrl,
  deleteOrderAttachment,
} from "@/lib/actions/order-attachments";

type Props = {
  orderId: string;
  attachments: any[];
};

export function OrderAttachments({
  orderId,
  attachments,
}: Props) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Attachments
        </h2>

        <p className="text-xs text-slate-500">
          Upload photos, drawings, measurements and PDFs
        </p>
      </div>

      <div className="space-y-3">
        <input
          type="file"
          accept="image/*,.pdf"
          capture="environment"
          onChange={(e) =>
            setFile(e.target.files?.[0] ?? null)
          }
          className="block w-full text-sm"
        />

        {file && (
          <div className="rounded-lg border border-slate-200 p-3 text-sm">
            <p>
              <strong>Selected:</strong> {file.name}
            </p>

            <p className="text-xs text-slate-500">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        )}

        <button
  type="button"
  onClick={async () => {
    try {
      if (!file) {
        alert("No file selected");
        return;
      }

      alert(`Uploading ${file.name}...`);

      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadOrderAttachment(
        orderId,
        formData
      );

      console.log(result);

      alert("Upload completed");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Upload failed"
      );
    }
  }}
  className="rounded-lg bg-blue-600 px-4 py-2 text-white"
>
  Upload Attachment
</button>
      </div>

      <div className="mt-6 border-t pt-4">
        <h3 className="mb-2 text-sm font-semibold">
          Uploaded Files
        </h3>

        {attachments.length === 0 ? (
  <p className="text-sm text-slate-500">
    No attachments yet.
  </p>
) : (
  <ul className="space-y-2">
    {attachments.map((file) => (
      <li
        key={file.id}
        className="rounded border p-2 text-sm"
      >
        <div className="flex items-center justify-between">
  <div>
    <p className="font-medium">
      {file.file_name}
    </p>

    <p className="text-xs text-slate-500">
      {(file.file_size / 1024).toFixed(1)} KB
    </p>
  </div>

  <button
  type="button"
  onClick={async () => {
    try {
      const url = await getAttachmentUrl(
        file.file_path
      );

      window.open(url, "_blank");
    } catch (error) {
      console.error(error);
      alert("Unable to open file");
    }
  }}
  className="text-blue-600 hover:underline"
>
  View
  
</button>
<button
  type="button"
  onClick={async () => {
    const confirmed = window.confirm(
      `Delete ${file.file_name}?`
    );

    if (!confirmed) return;

    try {
      await deleteOrderAttachment(
        file.id,
        file.file_path
      );

      alert("Attachment deleted");

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  }}
  className="ml-3 text-red-600 hover:underline"
>
  Delete
</button>
</div>

      </li>
    ))}
  </ul>
)}
      </div>
    </section>
  );
}
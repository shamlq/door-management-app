"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  className?: string;
};

export function SubmitButton({
  label,
  pendingLabel = "Saving...",
  className = "",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 transition-colors ${className}`}
      style={{ backgroundColor: "var(--accent)" }}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

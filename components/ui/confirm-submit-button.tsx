"use client";

type ConfirmSubmitButtonProps = {
  label: string;
  message: string;
  className: string;
};

export function ConfirmSubmitButton({
  label,
  message,
  className,
}: ConfirmSubmitButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        const confirmed = window.confirm(message);

        if (!confirmed) {
          e.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
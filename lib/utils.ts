

export function formatDate(date: string | null | undefined) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-GB");
}
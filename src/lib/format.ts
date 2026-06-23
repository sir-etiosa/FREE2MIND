export const money = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

export const hours = (minutes: number) => `${(minutes / 60).toFixed(2)}h`;

export function dateShort(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function dateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function relativeDays(iso: string): string {
  const diff = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (diff === 0) return "today";
  if (diff > 0) return `in ${diff}d`;
  return `${-diff}d overdue`;
}

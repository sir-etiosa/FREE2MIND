import type { ReactNode } from "react";

const STATUS_TONE: Record<string, string> = {
  // leads
  New: "bg-sky-soft text-sky",
  Contacted: "bg-sky-soft text-sky-deep",
  "Engagement Sent": "bg-nebula-soft text-nebula",
  Converted: "bg-positive/10 text-positive",
  Declined: "bg-muted/10 text-muted",
  Lost: "bg-muted/10 text-muted",
  // matters
  Intake: "bg-sky-soft text-sky",
  Active: "bg-positive/10 text-positive",
  "Awaiting Client": "bg-flag/10 text-flag",
  Closed: "bg-muted/10 text-muted",
  // invoices
  Draft: "bg-muted/10 text-muted",
  Sent: "bg-sky-soft text-sky-deep",
  Paid: "bg-positive/10 text-positive",
  "Partially Paid": "bg-flag/10 text-flag",
  Overdue: "bg-danger/10 text-danger",
};

export function StatusBadge({ value }: { value: string }) {
  const tone = STATUS_TONE[value] ?? "bg-muted/10 text-muted";
  return <span className={`pill ${tone}`}>{value}</span>;
}

export function PageHead({ eyebrow, title, sub, action }: { eyebrow: string; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-nebula-soft text-nebula">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-medium text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{hint}</p>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-nebula" />
      Loading…
    </div>
  );
}

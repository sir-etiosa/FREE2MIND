"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { money, dateShort } from "@/lib/format";
import { PageHead, Spinner, StatusBadge } from "@/components/ui";

type Matter = { id: string; name: string; status: string; clientName: string; practiceArea: string };
type Invoice = { id: string; number: string; status: string; subtotalCents: number; paidCents: number; dueDate: string; lines: { description: string; amountCents: number }[] };

export default function PortalPage() {
  const [matter, setMatter] = useState<Matter | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paying, setPaying] = useState<string>();
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const matters = await api.get<Matter[]>("/api/matters");
    const m = matters[0] ?? null;
    setMatter(m);
    if (m) {
      const inv = await api.get<Invoice[]>(`/api/invoices?matterId=${m.id}`);
      // Portal hides Draft-stage invoices (Section 7.3).
      setInvoices(inv.filter((i) => i.status !== "Draft"));
    }
    setReady(true);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function pay(inv: Invoice) {
    setPaying(inv.id);
    try {
      await api.post("/api/payments/checkout", { invoiceId: inv.id, amount: (inv.subtotalCents - inv.paidCents) / 100 });
      await load();
    } finally { setPaying(undefined); }
  }

  if (!ready) return <Spinner />;
  if (!matter) return <p className="text-sm text-muted">No matters available to preview.</p>;

  return (
    <>
      <PageHead eyebrow={`Client portal preview · ${matter.clientName}`} title="Your matter"
        sub="What your client sees. Scoped to their record only — internal notes and draft invoices never appear here." />

      <section className="mb-6 overflow-hidden rounded-2xl border border-line shadow-card">
        <div className="bg-nebula px-5 py-4 text-white">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/75">{matter.practiceArea}</p>
          <p className="mt-1 font-display text-lg font-semibold">{matter.name}</p>
        </div>
        <div className="flex items-center justify-between bg-surface px-5 py-3">
          <span className="text-sm text-muted">Current status</span>
          <StatusBadge value={matter.status} />
        </div>
      </section>

      <h2 className="mb-3 font-display text-base font-semibold text-ink">Invoices &amp; payments</h2>
      <div className="space-y-4">
        {invoices.length === 0 && <p className="card p-5 text-sm text-muted">No invoices have been sent to you yet.</p>}
        {invoices.map((inv) => {
          const balance = inv.subtotalCents - inv.paidCents;
          return (
            <section key={inv.id} className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-display text-base font-semibold text-ink">{inv.number}</span>
                <StatusBadge value={inv.status} />
              </div>
              <div className="divide-y divide-line border-y border-line">
                {inv.lines.map((l, i) => (
                  <div key={i} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-ink">{l.description}</span>
                    <span className="font-mono text-ink">{money(l.amountCents)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-muted">Balance due {money(balance)} · due {dateShort(inv.dueDate)}</span>
                {balance > 0
                  ? <button className="btn-primary" disabled={paying === inv.id} onClick={() => pay(inv)}>
                      {paying === inv.id ? "Processing…" : `Pay ${money(balance)}`}
                    </button>
                  : <span className="pill bg-positive/10 text-positive">Paid in full</span>}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-6 text-center font-mono text-[11px] text-muted">Payments processed securely via Stripe · demo uses a stub endpoint</p>
    </>
  );
}

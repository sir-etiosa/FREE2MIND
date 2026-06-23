"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { money, dateShort } from "@/lib/format";
import { PageHead, Spinner, StatusBadge } from "@/components/ui";

type Invoice = { id: string; number: string; matterId: string; matterName: string; clientName: string; status: string; subtotalCents: number; paidCents: number; dueDate: string };

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>();
  useEffect(() => { api.get<Invoice[]>("/api/invoices").then(setInvoices); }, []);
  if (!invoices) return <Spinner />;

  const outstanding = invoices.reduce((s, i) => s + (i.subtotalCents - i.paidCents), 0);

  return (
    <>
      <PageHead eyebrow="Accounts receivable" title="Invoices"
        sub={`${money(outstanding)} outstanding across ${invoices.length} ${invoices.length === 1 ? "invoice" : "invoices"}.`} />
      <div className="card divide-y divide-line">
        {invoices.map((i) => (
          <Link key={i.id} href={`/matters/${i.matterId}`} className="flex items-center justify-between gap-4 p-5 transition hover:bg-canvas/60">
            <div className="flex items-center gap-3">
              <span className="font-display text-base font-semibold text-ink">{i.number}</span>
              <StatusBadge value={i.status} />
            </div>
            <div className="hidden flex-1 px-4 text-sm text-muted sm:block">{i.clientName} · {i.matterName}</div>
            <div className="text-right">
              <p className="font-mono text-sm font-semibold text-ink">{money(i.subtotalCents - i.paidCents)}</p>
              <p className="text-xs text-muted">of {money(i.subtotalCents)} · due {dateShort(i.dueDate)}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

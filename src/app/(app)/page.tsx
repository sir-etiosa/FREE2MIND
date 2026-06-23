"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { money, dateShort, relativeDays } from "@/lib/format";
import { PageHead, Spinner, StatusBadge } from "@/components/ui";

type Dash = {
  overdueDeadlines: { id: string; title: string; dueDate: string; matterId: string; matterName: string }[];
  overdueInvoices: { id: string; number: string; matterId: string; subtotalCents: number; paidCents: number }[];
  retainerGap: { id: string; name: string; retainerAgreedCents: number }[];
  staleMatters: { id: string; name: string; practiceArea: string }[];
  pendingLeads: { id: string; name: string; status: string; matterDescription: string }[];
  staleDays: number;
};

const tiles = (d: Dash) => [
  { label: "Pending leads", value: d.pendingLeads.length, href: "/leads", hero: true },
  { label: "Overdue deadlines", value: d.overdueDeadlines.length, href: "/matters" },
  { label: "Overdue invoices", value: d.overdueInvoices.length, href: "/invoices" },
  { label: "Retainer gaps", value: d.retainerGap.length, href: "/matters" },
  { label: `Quiet ${d.staleDays}d+`, value: d.staleMatters.length, href: "/matters" },
];

export default function Dashboard() {
  const [d, setD] = useState<Dash | null>(null);
  const [err, setErr] = useState<string>();

  useEffect(() => {
    api.get<Dash>("/api/dashboard").then(setD).catch((e) => setErr(e.message));
  }, []);

  if (err) return <p className="text-sm text-danger">{err}</p>;
  if (!d) return <Spinner />;

  return (
    <>
      <PageHead
        eyebrow="Firm dashboard · live view"
        title="Good morning, Jordan"
        sub="Everything that needs your attention, pulled live across the firm. Nothing here is stored — it is queried the moment you open it."
      />

      {/* Hero stat strip */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {tiles(d).map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className={
              t.hero
                ? "rounded-2xl bg-nebula p-5 text-white shadow-lift transition hover:brightness-[1.03]"
                : "card p-5 transition hover:-translate-y-0.5 hover:shadow-lift"
            }
          >
            <p className={`stat-num ${t.hero ? "text-white" : ""}`}>{t.value}</p>
            <p className={`mt-1 text-xs font-medium ${t.hero ? "text-white/80" : "text-muted"}`}>{t.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Overdue deadlines" hint="Sorted by how overdue they are.">
          {d.overdueDeadlines.length === 0 ? (
            <Quiet>No overdue deadlines. Calendars are clean.</Quiet>
          ) : (
            d.overdueDeadlines.map((x) => (
              <Row key={x.id} href={`/matters/${x.matterId}`} left={x.title} sub={x.matterName}
                right={<span className="text-sm font-semibold text-danger">{relativeDays(x.dueDate)}</span>} />
            ))
          )}
        </Panel>

        <Panel title="Overdue invoices" hint="Sent, past due, balance outstanding.">
          {d.overdueInvoices.length === 0 ? (
            <Quiet>No overdue invoices.</Quiet>
          ) : (
            d.overdueInvoices.map((x) => (
              <Row key={x.id} href={`/invoices`} left={x.number} sub="Outstanding balance"
                right={<span className="text-sm font-semibold text-danger">{money(x.subtotalCents - x.paidCents)}</span>} />
            ))
          )}
        </Panel>

        <Panel title="Retainer not collected" hint="Work has begun but the retainer is unpaid.">
          {d.retainerGap.length === 0 ? (
            <Quiet>Every active matter with logged time has its retainer.</Quiet>
          ) : (
            d.retainerGap.map((x) => (
              <Row key={x.id} href={`/matters/${x.id}`} left={x.name} sub="Time logged · retainer pending"
                right={<span className="pill bg-flag/10 text-flag">Flagged</span>} />
            ))
          )}
        </Panel>

        <Panel title={`Quiet matters (${d.staleDays}d+)`} hint="No activity in the trailing window.">
          {d.staleMatters.length === 0 ? (
            <Quiet>No matters have gone quiet.</Quiet>
          ) : (
            d.staleMatters.map((x) => (
              <Row key={x.id} href={`/matters/${x.id}`} left={x.name} sub={x.practiceArea}
                right={<span className="pill bg-muted/10 text-muted">Stale</span>} />
            ))
          )}
        </Panel>

        <Panel title="Pending leads" hint="Awaiting review or follow-up." wide>
          {d.pendingLeads.length === 0 ? (
            <Quiet>No leads waiting in the queue.</Quiet>
          ) : (
            d.pendingLeads.map((x) => (
              <Row key={x.id} href="/leads" left={x.name} sub={x.matterDescription}
                right={<StatusBadge value={x.status} />} />
            ))
          )}
        </Panel>
      </div>
    </>
  );
}

function Panel({ title, hint, wide, children }: { title: string; hint: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <section className={`card p-5 ${wide ? "lg:col-span-2" : ""}`}>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
        <span className="text-xs text-muted">{hint}</span>
      </div>
      <div className="divide-y divide-line">{children}</div>
    </section>
  );
}

function Row({ href, left, sub, right }: { href: string; left: string; sub: string; right: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-4 py-3 transition hover:bg-canvas/60 -mx-2 px-2 rounded-lg">
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-ink">{left}</span>
        <span className="block truncate text-xs text-muted">{sub}</span>
      </span>
      {right}
    </Link>
  );
}

function Quiet({ children }: { children: React.ReactNode }) {
  return <p className="py-3 text-sm text-muted">{children}</p>;
}

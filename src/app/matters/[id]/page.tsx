"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { money, hours, dateShort, dateTime, relativeDays } from "@/lib/format";
import { Spinner, StatusBadge } from "@/components/ui";

type Detail = {
  matter: {
    id: string; name: string; practiceArea: string; status: string; rateModel: string;
    matterRateOverrideCents: number | null; practiceAreaRateCents: number | null;
  };
  client: { id: string; name: string; email: string } | null;
  attorney: { id: string; name: string; defaultRateCents: number } | null;
  summary: {
    status: string; retainerCollected: boolean; retainerAgreedCents: number; retainerCollectedCents: number;
    lastActivityAt: string | null; nextDeadline: { title: string; dueDate: string } | null;
    lastClientContact: { at: string; method: string } | null;
  };
  timeline: { id: string; kind: string; summary: string; actor: string; at: string }[];
  notes: { id: string; body: string; tag: string | null; author: string; at: string }[];
  timeEntries: { id: string; date: string; minutes: number; rateCents: number; amountCents: number; clientFacing: string; internalNote: string | null; invoiceId: string | null; userId: string }[];
  invoices: { id: string; number: string; status: string; subtotalCents: number; paidCents: number; dueDate: string; lines: { description: string; amountCents: number }[] }[];
};

const USERS = [
  { id: "u_jh", name: "Jordan Hale" },
  { id: "u_pv", name: "Priya Vance" },
  { id: "u_ms", name: "Marcus Soto" },
];
const NOTE_TAGS = ["Client Call", "Internal", "Research", "Court Appearance"];
const KIND_DOT: Record<string, string> = {
  communication: "bg-sky", payment: "bg-positive", invoice: "bg-nebula",
  time: "bg-flag", note: "bg-muted", system: "bg-ink/40", status: "bg-sky-deep",
};

export default function MatterDetail({ params }: { params: { id: string } }) {
  const [d, setD] = useState<Detail | null>(null);
  const [tab, setTab] = useState<"timeline" | "time" | "billing" | "notes">("timeline");

  const load = useCallback(() => api.get<Detail>(`/api/matters/${params.id}`).then(setD), [params.id]);
  useEffect(() => { load(); }, [load]);

  if (!d) return <Spinner />;
  const { matter, client, attorney, summary } = d;
  const rateLabel =
    matter.matterRateOverrideCents != null ? `${money(matter.matterRateOverrideCents)}/hr · matter override`
    : matter.practiceAreaRateCents != null ? `${money(matter.practiceAreaRateCents)}/hr · practice-area rate`
    : `${money(attorney?.defaultRateCents ?? 0)}/hr · firm default`;

  return (
    <>
      <Link href="/matters" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-sky">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        All matters
      </Link>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-2">{matter.practiceArea} · {client?.name}</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">{matter.name}</h1>
        </div>
        <StatusBadge value={matter.status} />
      </div>

      {/* SUMMARY BLOCK — computed live (Section 1.7) */}
      <section className="mb-6 overflow-hidden rounded-2xl border border-line shadow-card">
        <div className="bg-nebula px-5 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/75">Matter summary · updates itself</p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-5">
          <Cell label="Status" value={summary.status} />
          <Cell label="Retainer"
            value={summary.retainerCollected ? `${money(summary.retainerCollectedCents)} in` : `${money(summary.retainerAgreedCents)} due`}
            tone={summary.retainerCollected ? "positive" : "flag"} />
          <Cell label="Last activity" value={dateTime(summary.lastActivityAt)} />
          <Cell label="Next deadline"
            value={summary.nextDeadline ? `${summary.nextDeadline.title}` : "None"}
            hint={summary.nextDeadline ? relativeDays(summary.nextDeadline.dueDate) : undefined} />
          <Cell label="Last client contact"
            value={summary.lastClientContact ? dateShort(summary.lastClientContact.at) : "None"}
            hint={summary.lastClientContact?.method} />
        </div>
      </section>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-line bg-surface p-1">
        {(["timeline", "time", "billing", "notes"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition ${tab === t ? "bg-nebula-soft text-nebula" : "text-muted hover:text-ink"}`}>
            {t === "time" ? "Time entries" : t}
          </button>
        ))}
      </div>

      {tab === "timeline" && (
        <section className="card p-5">
          <p className="mb-4 text-xs text-muted">Append-only. Editing creates a new entry — history is never overwritten.</p>
          <ol className="relative ml-2 border-l border-line">
            {d.timeline.map((e) => (
              <li key={e.id} className="relative mb-5 pl-5 last:mb-0">
                <span className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ${KIND_DOT[e.kind] ?? "bg-muted"}`} />
                <p className="text-sm text-ink">{e.summary}</p>
                <p className="font-mono text-[11px] text-muted">{e.actor} · {dateTime(e.at)}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {tab === "time" && <TimeTab d={d} rateLabel={rateLabel} onChange={load} />}
      {tab === "billing" && <BillingTab d={d} onChange={load} />}
      {tab === "notes" && <NotesTab d={d} onChange={load} />}
    </>
  );
}

function Cell({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "positive" | "flag" }) {
  const color = tone === "positive" ? "text-positive" : tone === "flag" ? "text-flag" : "text-ink";
  return (
    <div className="bg-surface px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className={`mt-1 truncate text-sm font-semibold ${color}`} title={value}>{value}</p>
      {hint && <p className="truncate text-[11px] text-muted" title={hint}>{hint}</p>}
    </div>
  );
}

function TimeTab({ d, rateLabel, onChange }: { d: Detail; rateLabel: string; onChange: () => void }) {
  const [userId, setUserId] = useState(d.attorney?.id ?? "u_jh");
  const [minutes, setMinutes] = useState(30);
  const [clientFacing, setClientFacing] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!clientFacing.trim()) return;
    setBusy(true);
    try {
      await api.post("/api/time-entries", { matterId: d.matter.id, userId, minutes: Number(minutes), clientFacing, internalNote });
      setClientFacing(""); setInternalNote(""); setMinutes(30);
      await onChange();
    } finally { setBusy(false); }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 text-xs">
          <span className="font-mono uppercase tracking-[0.14em] text-muted">Logged time</span>
          <span className="text-muted">Rate resolves to <strong className="text-nebula">{rateLabel}</strong></span>
        </div>
        <div className="divide-y divide-line border-t border-line">
          {d.timeEntries.length === 0 && <p className="px-5 py-6 text-sm text-muted">No time logged yet.</p>}
          {d.timeEntries.map((t) => (
            <div key={t.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-ink">{t.clientFacing}</p>
                  {t.internalNote && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-flag">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      Internal: {t.internalNote}
                    </p>
                  )}
                  <p className="mt-1 font-mono text-[11px] text-muted">{dateShort(t.date)} · {hours(t.minutes)} · {money(t.rateCents)}/hr {t.invoiceId ? "· billed" : "· unbilled"}</p>
                </div>
                <span className="font-mono text-sm font-semibold text-ink">{money(t.amountCents)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card h-fit p-5">
        <h3 className="mb-3 font-display text-base font-semibold text-ink">Log time</h3>
        <label className="field-label">Attorney / staff</label>
        <select className="field mb-3" value={userId} onChange={(e) => setUserId(e.target.value)}>
          {USERS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <label className="field-label">Minutes</label>
        <input className="field mb-3" type="number" min={1} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
        <label className="field-label">Client-facing description <span className="text-muted">(shows on invoice)</span></label>
        <input className="field mb-3" value={clientFacing} onChange={(e) => setClientFacing(e.target.value)} placeholder="Reviewed and revised settlement terms" />
        <label className="field-label">Internal note <span className="text-muted">(firm-only, never billed)</span></label>
        <textarea className="field mb-4" rows={2} value={internalNote} onChange={(e) => setInternalNote(e.target.value)} placeholder="Optional" />
        <button className="btn-primary w-full" disabled={busy} onClick={submit}>{busy ? "Saving…" : "Add time entry"}</button>
      </section>
    </div>
  );
}

function BillingTab({ d, onChange }: { d: Detail; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const unbilled = d.timeEntries.filter((t) => !t.invoiceId && t.amountCents > 0);
  const unbilledTotal = unbilled.reduce((s, t) => s + t.amountCents, 0);

  async function generate() {
    setBusy(true);
    try { await api.post("/api/invoices/generate", { matterId: d.matter.id }); await onChange(); }
    catch (e) { alert((e as Error).message); }
    finally { setBusy(false); }
  }
  async function finalize(id: string) { await api.post(`/api/invoices/${id}/finalize`); await onChange(); }

  return (
    <div className="space-y-5">
      <section className="card flex items-center justify-between p-5">
        <div>
          <p className="font-display text-base font-semibold text-ink">Unbilled work</p>
          <p className="text-sm text-muted">{unbilled.length} time {unbilled.length === 1 ? "entry" : "entries"} · {money(unbilledTotal)}</p>
        </div>
        <button className="btn-primary" disabled={busy || unbilled.length === 0} onClick={generate}>
          {busy ? "Generating…" : "Generate draft invoice"}
        </button>
      </section>

      {d.invoices.map((inv) => {
        const balance = inv.subtotalCents - inv.paidCents;
        return (
          <section key={inv.id} className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-display text-base font-semibold text-ink">{inv.number}</span>
                <StatusBadge value={inv.status} />
              </div>
              {inv.status === "Draft"
                ? <button className="btn-ghost" onClick={() => finalize(inv.id)}>Send invoice</button>
                : <span className="font-mono text-xs text-muted">Due {dateShort(inv.dueDate)}</span>}
            </div>
            <div className="divide-y divide-line border-y border-line">
              {inv.lines.map((l, i) => (
                <div key={i} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-ink">{l.description}</span>
                  <span className="font-mono text-ink">{money(l.amountCents)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted">Paid {money(inv.paidCents)} of {money(inv.subtotalCents)}</span>
              <span className="font-display text-base font-semibold text-ink">Balance {money(balance)}</span>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function NotesTab({ d, onChange }: { d: Detail; onChange: () => void }) {
  const [body, setBody] = useState("");
  const [tag, setTag] = useState(NOTE_TAGS[0]);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!body.trim()) return;
    setBusy(true);
    try { await api.post(`/api/matters/${d.matter.id}/notes`, { body, tag }); setBody(""); await onChange(); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="card divide-y divide-line">
        {d.notes.length === 0 && <p className="p-5 text-sm text-muted">No notes yet. The first one starts the record.</p>}
        {d.notes.map((n) => (
          <div key={n.id} className="p-5">
            <div className="mb-1 flex items-center gap-2">
              {n.tag && <span className="pill bg-sky-soft text-sky">{n.tag}</span>}
              <span className="font-mono text-[11px] text-muted">{n.author} · {dateTime(n.at)}</span>
            </div>
            <p className="text-sm text-ink">{n.body}</p>
          </div>
        ))}
      </section>
      <section className="card h-fit p-5">
        <h3 className="mb-3 font-display text-base font-semibold text-ink">Add note</h3>
        <label className="field-label">Type</label>
        <select className="field mb-3" value={tag} onChange={(e) => setTag(e.target.value)}>
          {NOTE_TAGS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <label className="field-label">Note</label>
        <textarea className="field mb-4" rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="What happened…" />
        <button className="btn-primary w-full" disabled={busy} onClick={submit}>{busy ? "Saving…" : "Save note"}</button>
        <p className="mt-2 text-[11px] text-muted">Notes are immutable once saved.</p>
      </section>
    </div>
  );
}

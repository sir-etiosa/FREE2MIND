"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { money, hours, dateShort } from "@/lib/format";
import { PageHead, Spinner } from "@/components/ui";

type Entry = { id: string; matterId: string; date: string; minutes: number; rateCents: number; amountCents: number; clientFacing: string; invoiceId: string | null };
type Matter = { id: string; name: string };

export default function TimePage() {
  const [entries, setEntries] = useState<Entry[]>();
  const [matters, setMatters] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get<Entry[]>("/api/time-entries").then((e) => setEntries(e.sort((a, b) => b.date.localeCompare(a.date))));
    api.get<Matter[]>("/api/matters").then((m) => setMatters(Object.fromEntries(m.map((x) => [x.id, x.name]))));
  }, []);

  if (!entries) return <Spinner />;
  const total = entries.reduce((s, e) => s + e.amountCents, 0);
  const totalMin = entries.reduce((s, e) => s + e.minutes, 0);

  return (
    <>
      <PageHead eyebrow="Billing input" title="Time entries"
        sub={`${hours(totalMin)} logged across the firm · ${money(total)} in tracked value.`} />
      <div className="card overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-line px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          <span>Work</span><span>Date</span><span>Time</span><span className="text-right">Amount</span>
        </div>
        <div className="divide-y divide-line">
          {entries.map((e) => (
            <div key={e.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-ink">{e.clientFacing}</p>
                <Link href={`/matters/${e.matterId}`} className="truncate text-xs text-sky hover:underline">{matters[e.matterId] ?? e.matterId}</Link>
              </div>
              <span className="font-mono text-xs text-muted">{dateShort(e.date)}</span>
              <span className="font-mono text-xs text-muted">{hours(e.minutes)}</span>
              <span className="text-right font-mono text-sm font-medium text-ink">{money(e.amountCents)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

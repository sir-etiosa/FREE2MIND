"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { money, dateShort } from "@/lib/format";
import { PageHead, Spinner, StatusBadge } from "@/components/ui";

type Matter = {
  id: string; name: string; practiceArea: string; status: string; clientName: string;
  attorney: string; openDate: string; retainerCollected: boolean;
  retainerAgreedCents: number; rateModel: string;
};

export default function MattersPage() {
  const [matters, setMatters] = useState<Matter[]>();
  useEffect(() => { api.get<Matter[]>("/api/matters").then(setMatters); }, []);
  if (!matters) return <Spinner />;

  return (
    <>
      <PageHead eyebrow="Active work" title="Matters" sub="Every note, document, time entry, and invoice attaches here." />
      <div className="grid gap-4 sm:grid-cols-2">
        {matters.map((m) => (
          <Link key={m.id} href={`/matters/${m.id}`} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-base font-semibold text-ink">{m.name}</h3>
              <StatusBadge value={m.status} />
            </div>
            <p className="mt-1 text-sm text-muted">{m.clientName} · {m.practiceArea}</p>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
              <span className="font-mono text-muted">{m.attorney} · opened {dateShort(m.openDate)}</span>
              {m.retainerCollected
                ? <span className="pill bg-positive/10 text-positive">Retainer in</span>
                : <span className="pill bg-flag/10 text-flag">Retainer {money(m.retainerAgreedCents)} due</span>}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

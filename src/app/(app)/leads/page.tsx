"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { dateShort } from "@/lib/format";
import { PageHead, Spinner, StatusBadge } from "@/components/ui";

type Lead = {
  id: string; name: string; email: string; phone: string; matterDescription: string;
  opposingParties: string[]; referralSource: string; status: string; createdAt: string;
  conflictFlag?: string | null;
};

const AREAS = ["Family Law", "Corporate", "Estate Planning", "Real Estate", "Litigation"];

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>();
  const [busy, setBusy] = useState<string>();
  const [area, setArea] = useState(AREAS[0]);
  const [open, setOpen] = useState<string>();

  const load = () => api.get<Lead[]>("/api/leads").then(setLeads);
  useEffect(() => { load(); }, []);

  async function convert(id: string) {
    setBusy(id);
    try {
      const { matter } = await api.post<{ matter: { id: string } }>(`/api/leads/${id}/convert`, { practiceArea: area });
      router.push(`/matters/${matter.id}`);
    } catch (e) {
      alert((e as Error).message);
      setBusy(undefined);
    }
  }

  if (!leads) return <Spinner />;

  return (
    <>
      <PageHead
        eyebrow="Intake pipeline"
        title="Leads"
        sub="A lead is never a client until the engagement letter is signed. Converting one here simulates that signature event."
      />

      <div className="card divide-y divide-line">
        {leads.map((l) => {
          const converted = l.status === "Converted";
          const blocked = !!l.conflictFlag;
          const isOpen = open === l.id;
          return (
            <div key={l.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-base font-semibold text-ink">{l.name}</h3>
                    <StatusBadge value={l.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted">{l.matterDescription}</p>
                  <p className="mt-2 font-mono text-xs text-muted">
                    {l.referralSource} · added {dateShort(l.createdAt)}
                    {l.opposingParties.length > 0 && <> · vs. {l.opposingParties.join(", ")}</>}
                  </p>
                </div>

                {!converted && (
                  <div className="flex items-center gap-2">
                    {!isOpen ? (
                      <button className="btn-primary" disabled={blocked} onClick={() => setOpen(l.id)}>
                        {blocked ? "Resolve conflict first" : "Convert to client"}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <select className="field !w-44" value={area} onChange={(e) => setArea(e.target.value)}>
                          {AREAS.map((a) => <option key={a}>{a}</option>)}
                        </select>
                        <button className="btn-primary" disabled={busy === l.id} onClick={() => convert(l.id)}>
                          {busy === l.id ? "Signing…" : "Sign & open matter"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {blocked && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 px-3 py-2.5 text-sm text-danger">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                    <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span><strong>Conflict check:</strong> {l.conflictFlag}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

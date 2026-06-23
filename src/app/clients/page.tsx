"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { dateShort } from "@/lib/format";
import { PageHead, Spinner } from "@/components/ui";

type Client = { id: string; name: string; email: string; phone: string; portalAccess: boolean; createdAt: string };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>();
  useEffect(() => { api.get<Client[]>("/api/clients").then(setClients); }, []);
  if (!clients) return <Spinner />;

  return (
    <>
      <PageHead eyebrow="Relationships" title="Clients" sub="Created only at conversion. One client can hold many matters." />
      <div className="card divide-y divide-line">
        {clients.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-nebula-soft font-display text-sm font-semibold text-nebula">
                {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </span>
              <div>
                <p className="font-medium text-ink">{c.name}</p>
                <p className="font-mono text-xs text-muted">{c.email} · {c.phone}</p>
              </div>
            </div>
            <div className="text-right">
              {c.portalAccess && <span className="pill bg-positive/10 text-positive">Portal active</span>}
              <p className="mt-1 text-xs text-muted">Client since {dateShort(c.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

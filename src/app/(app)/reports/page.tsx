"use client";

import { useEffect, useState } from "react";
import { PageHead, Spinner } from "@/components/ui";

interface ReportData {
  revenueCollectedCents: number;
  revenueBilledCents: number;
  timeByAttorney: { name: string; minutes: number; amountCents: number }[];
  invoicesByStatus: { status: string; count: number; totalCents: number }[];
  leadFunnel: { status: string; count: number }[];
  mattersByArea: { area: string; count: number }[];
}

function fmtMoney(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
}

function fmtHours(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div><PageHead eyebrow="Analytics" title="Reports & analytics" /><Spinner /></div>;
  if (!data) return null;

  const outstanding = data.revenueBilledCents - data.revenueCollectedCents;
  const totalLeads = data.leadFunnel.reduce((s, l) => s + l.count, 0);
  const totalMatters = data.mattersByArea.reduce((s, a) => s + a.count, 0);

  return (
    <div>
      <PageHead eyebrow="Analytics" title="Reports & analytics" />

      {/* Stat strip */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="card px-6 py-5">
          <p className="eyebrow mb-2">Total billed</p>
          <p className="stat-num">{fmtMoney(data.revenueBilledCents)}</p>
          <p className="mt-1 text-xs text-muted">All non-draft invoices</p>
        </div>
        <div className="card px-6 py-5">
          <p className="eyebrow mb-2">Total collected</p>
          <p className="stat-num text-positive">{fmtMoney(data.revenueCollectedCents)}</p>
          <p className="mt-1 text-xs text-muted">Payments received</p>
        </div>
        <div className="card px-6 py-5">
          <p className="eyebrow mb-2">Outstanding</p>
          <p className={`stat-num ${outstanding > 0 ? "text-flag" : "text-positive"}`}>{fmtMoney(outstanding)}</p>
          <p className="mt-1 text-xs text-muted">Billed minus collected</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Revenue by invoice status */}
        <div className="card p-6">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Revenue by invoice status</h2>
          {data.invoicesByStatus.length === 0 ? (
            <p className="text-sm text-muted">No invoices yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="pb-2 font-medium text-muted">Status</th>
                  <th className="pb-2 text-right font-medium text-muted">Count</th>
                  <th className="pb-2 text-right font-medium text-muted">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.invoicesByStatus.map((row) => (
                  <tr key={row.status}>
                    <td className="py-2 text-ink">{row.status}</td>
                    <td className="py-2 text-right text-muted">{row.count}</td>
                    <td className="py-2 text-right font-medium text-ink">{fmtMoney(row.totalCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Time by attorney */}
        <div className="card p-6">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Time logged by attorney</h2>
          {data.timeByAttorney.length === 0 ? (
            <p className="text-sm text-muted">No time entries yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="pb-2 font-medium text-muted">Attorney</th>
                  <th className="pb-2 text-right font-medium text-muted">Hours</th>
                  <th className="pb-2 text-right font-medium text-muted">Billed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.timeByAttorney.map((row) => (
                  <tr key={row.name}>
                    <td className="py-2 text-ink">{row.name}</td>
                    <td className="py-2 text-right text-muted">{fmtHours(row.minutes)}</td>
                    <td className="py-2 text-right font-medium text-ink">{fmtMoney(row.amountCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Lead pipeline */}
        <div className="card p-6">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Lead pipeline</h2>
          {data.leadFunnel.length === 0 ? (
            <p className="text-sm text-muted">No leads yet.</p>
          ) : (
            <div className="space-y-3">
              {data.leadFunnel.map((row) => (
                <div key={row.status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-ink">{row.status}</span>
                    <span className="font-semibold text-ink">{row.count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-nebula transition-all"
                      style={{ width: `${totalLeads > 0 ? (row.count / totalLeads) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Matters by practice area */}
        <div className="card p-6">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Matters by practice area</h2>
          {data.mattersByArea.length === 0 ? (
            <p className="text-sm text-muted">No matters yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.mattersByArea.map((row) => (
                <span key={row.area} className="pill bg-nebula-soft text-nebula">
                  {row.area}
                  <span className="ml-1 font-bold">{row.count}</span>
                </span>
              ))}
              <span className="pill bg-sky-soft text-sky">
                Total
                <span className="ml-1 font-bold">{totalMatters}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

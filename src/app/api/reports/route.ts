import { NextResponse } from "next/server";
import { repo } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const invoices = repo.invoices();
  const timeEntries = repo.timeEntries();
  const matters = repo.matters();
  const leads = repo.leads();
  const users = repo.users();

  // Revenue collected = sum of paidCents across all invoices
  const revenueCollectedCents = invoices.reduce((s, i) => s + i.paidCents, 0);

  // Revenue billed = sum of subtotalCents of all non-Draft invoices
  const revenueBilledCents = invoices
    .filter((i) => i.status !== "Draft")
    .reduce((s, i) => s + i.subtotalCents, 0);

  // Time by attorney
  const timeByAttorney = users.map((u) => {
    const entries = timeEntries.filter((t) => t.userId === u.id);
    const minutes = entries.reduce((s, t) => s + t.minutes, 0);
    const amountCents = entries.reduce((s, t) => s + t.amountCents, 0);
    return { name: u.name, minutes, amountCents };
  }).filter((a) => a.minutes > 0);

  // Invoices by status
  const statusMap: Record<string, { count: number; totalCents: number }> = {};
  for (const inv of invoices) {
    if (!statusMap[inv.status]) statusMap[inv.status] = { count: 0, totalCents: 0 };
    statusMap[inv.status].count += 1;
    statusMap[inv.status].totalCents += inv.subtotalCents;
  }
  const invoicesByStatus = Object.entries(statusMap).map(([status, v]) => ({ status, ...v }));

  // Lead funnel
  const leadStatusMap: Record<string, number> = {};
  for (const lead of leads) {
    leadStatusMap[lead.status] = (leadStatusMap[lead.status] ?? 0) + 1;
  }
  const leadFunnel = Object.entries(leadStatusMap).map(([status, count]) => ({ status, count }));

  // Matters by practice area
  const areaMap: Record<string, number> = {};
  for (const m of matters) {
    areaMap[m.practiceArea] = (areaMap[m.practiceArea] ?? 0) + 1;
  }
  const mattersByArea = Object.entries(areaMap).map(([area, count]) => ({ area, count }));

  return NextResponse.json({
    revenueCollectedCents,
    revenueBilledCents,
    timeByAttorney,
    invoicesByStatus,
    leadFunnel,
    mattersByArea,
  });
}

import { NextResponse } from "next/server";
import { repo } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const matter = repo.matter(params.id);
  if (!matter) return NextResponse.json({ error: "Matter not found" }, { status: 404 });
  return NextResponse.json({
    matter,
    client: repo.client(matter.clientId),
    attorney: repo.users().find((u) => u.id === matter.responsibleAttorneyId) ?? null,
    summary: repo.summary(matter.id),
    timeline: repo.timeline(matter.id),
    notes: repo.notes(matter.id),
    timeEntries: repo.timeEntries(matter.id),
    fixedCharges: repo.fixedCharges(matter.id),
    invoices: repo.invoices(matter.id),
    deadlines: repo.deadlines(matter.id),
  });
}

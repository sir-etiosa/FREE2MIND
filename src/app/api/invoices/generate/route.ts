import { NextResponse } from "next/server";
import { repo } from "@/lib/store";

export async function POST(req: Request) {
  const b = (await req.json()) as { matterId: string; from?: string; to?: string };
  if (!b.matterId) return NextResponse.json({ error: "matterId is required" }, { status: 400 });
  const from = b.from || new Date(0).toISOString();
  const to = b.to || new Date().toISOString();
  const invoice = repo.generateInvoice(b.matterId, from, to);
  if (!invoice) {
    return NextResponse.json({ error: "No unbilled time entries or billable charges in range" }, { status: 400 });
  }
  return NextResponse.json(invoice, { status: 201 });
}

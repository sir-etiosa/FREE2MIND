import { NextResponse } from "next/server";
import { repo, dollars } from "@/lib/store";

export async function POST(req: Request) {
  const b = (await req.json()) as {
    matterId: string; amount: number; clientFacing: string; internalNote?: string; billable?: boolean;
  };
  if (!b.matterId || !b.amount || !b.clientFacing?.trim()) {
    return NextResponse.json({ error: "matterId, amount and clientFacing are required" }, { status: 400 });
  }
  const fc = repo.addFixedCharge({
    matterId: b.matterId, amountCents: dollars(b.amount), clientFacing: b.clientFacing.trim(),
    internalNote: b.internalNote || null, billable: b.billable ?? true,
  });
  return NextResponse.json(fc, { status: 201 });
}

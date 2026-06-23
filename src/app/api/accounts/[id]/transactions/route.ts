import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const txns = repo.transactions(params.id);
  const matters = repo.matters();
  const enriched = txns.map((t) => ({
    ...t,
    matterName: t.matterId ? (matters.find((m) => m.id === t.matterId)?.name ?? "") : "",
  }));
  return NextResponse.json(enriched);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const accounts = repo.accounts();
  const account = accounts.find((a) => a.id === params.id);
  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }
  const txn = repo.addTransaction({
    accountId: params.id,
    matterId: body.matterId ?? null,
    clientId: body.clientId ?? null,
    type: body.type,
    amountCents: body.amountCents,
    description: body.description,
    reference: body.reference ?? null,
  });
  return NextResponse.json(txn, { status: 201 });
}

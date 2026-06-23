import { NextResponse } from "next/server";
import { repo } from "@/lib/store";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const inv = repo.finalizeInvoice(params.id);
  if (!inv) return NextResponse.json({ error: "Only draft invoices can be sent" }, { status: 400 });
  return NextResponse.json(inv);
}

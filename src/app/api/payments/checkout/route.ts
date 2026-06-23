import { NextResponse } from "next/server";
import { repo } from "@/lib/store";

// STUB (Section 7.3). In production this creates a Stripe Checkout/PaymentIntent.
// Here we record the payment immediately so the portal flow is demonstrable.
export async function POST(req: Request) {
  const b = (await req.json()) as { invoiceId: string; amount: number };
  if (!b.invoiceId || !b.amount) {
    return NextResponse.json({ error: "invoiceId and amount are required" }, { status: 400 });
  }
  const inv = repo.recordPayment(b.invoiceId, Math.round(b.amount * 100));
  if (!inv) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  return NextResponse.json({ ok: true, provider: "stub", invoice: inv });
}

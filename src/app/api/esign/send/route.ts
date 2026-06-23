import { NextResponse } from "next/server";

// STUB (Section 8). In production this calls the e-signature provider, returns a
// single-use signing link, and a webhook later fires the Lead->Client conversion
// (POST /api/leads/[id]/convert) on document completion.
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { documentId?: string; signerEmail?: string };
  return NextResponse.json({
    ok: true,
    provider: "stub",
    signingUrl: `https://sign.example/s/${Math.random().toString(36).slice(2, 10)}`,
    documentId: b.documentId ?? "doc_demo",
    signerEmail: b.signerEmail ?? "signer@example.com",
    note: "MVP stub — wire to DocuSign/Dropbox Sign; on completion call /api/leads/[id]/convert.",
  });
}

import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const matterId = searchParams.get("matterId") ?? undefined;
  const docs = repo.documents(matterId);
  // Enrich with matter name
  const matters = repo.matters();
  const enriched = docs.map((d) => ({
    ...d,
    matterName: d.matterId ? (matters.find((m) => m.id === d.matterId)?.name ?? "") : "",
  }));
  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const doc = repo.addDocument({
    matterId: body.matterId ?? null,
    clientId: body.clientId ?? null,
    name: body.name,
    folder: body.folder,
    tags: body.tags ?? [],
    sizeBytes: body.sizeBytes ?? 0,
    mimeType: body.mimeType ?? "application/octet-stream",
    uploadedBy: body.uploadedBy ?? "Jordan Hale",
  });
  return NextResponse.json(doc, { status: 201 });
}

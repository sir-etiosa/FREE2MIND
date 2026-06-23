import { NextResponse } from "next/server";
import { repo } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const matterId = new URL(req.url).searchParams.get("matterId") ?? undefined;
  return NextResponse.json(repo.timeEntries(matterId));
}

export async function POST(req: Request) {
  const b = (await req.json()) as {
    matterId: string; userId: string; date?: string; minutes: number;
    clientFacing: string; internalNote?: string;
  };
  if (!b.matterId || !b.userId || !b.minutes || !b.clientFacing?.trim()) {
    return NextResponse.json({ error: "matterId, userId, minutes and clientFacing are required" }, { status: 400 });
  }
  const entry = repo.addTimeEntry({
    matterId: b.matterId, userId: b.userId, date: b.date || new Date().toISOString(),
    minutes: b.minutes, clientFacing: b.clientFacing.trim(), internalNote: b.internalNote || null,
  });
  return NextResponse.json(entry, { status: 201 });
}

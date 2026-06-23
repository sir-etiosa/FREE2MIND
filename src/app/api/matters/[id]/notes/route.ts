import { NextResponse } from "next/server";
import { repo } from "@/lib/store";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { body, tag, author } = (await req.json()) as { body: string; tag?: string; author?: string };
  if (!body?.trim()) return NextResponse.json({ error: "Note body is required" }, { status: 400 });
  const note = repo.addNote(params.id, body.trim(), tag || null, author || "Jordan Hale");
  return NextResponse.json(note, { status: 201 });
}

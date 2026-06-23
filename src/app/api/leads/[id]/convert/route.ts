import { NextResponse } from "next/server";
import { repo } from "@/lib/store";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { practiceArea } = (await req.json().catch(() => ({}))) as { practiceArea?: string };
  const result = repo.convert(params.id, practiceArea || "General");
  if (!result) {
    return NextResponse.json({ error: "Lead cannot be converted (not found or already converted)" }, { status: 400 });
  }
  return NextResponse.json(result, { status: 201 });
}

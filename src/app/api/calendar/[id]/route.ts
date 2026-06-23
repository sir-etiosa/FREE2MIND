import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  if (body.complete !== true) {
    return NextResponse.json({ error: "Only { complete: true } is supported" }, { status: 400 });
  }
  const deadline = repo.completeDeadline(params.id);
  if (!deadline) {
    return NextResponse.json({ error: "Deadline not found" }, { status: 404 });
  }
  return NextResponse.json(deadline);
}

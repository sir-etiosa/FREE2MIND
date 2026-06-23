import { NextResponse } from "next/server";
import { repo } from "@/lib/store";
import type { LeadStatus } from "@/lib/types";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { status } = (await req.json()) as { status: LeadStatus };
  const lead = repo.setLeadStatus(params.id, status);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  return NextResponse.json(lead);
}

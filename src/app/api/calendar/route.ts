import { NextResponse } from "next/server";
import { repo } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const deadlines = repo.allDeadlines();
  return NextResponse.json(deadlines);
}

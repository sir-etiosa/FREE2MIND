import { NextResponse } from "next/server";
import { repo } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(repo.dashboard());
}

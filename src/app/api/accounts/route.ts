import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(repo.accounts());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const account = repo.addAccount({
    name: body.name,
    type: body.type ?? "operating",
  });
  return NextResponse.json(account, { status: 201 });
}

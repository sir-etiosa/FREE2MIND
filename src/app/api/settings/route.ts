import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    firm: repo.firm(),
    users: repo.users(),
  });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const updated = repo.updateFirm({
    ...(body.name !== undefined && { name: body.name }),
    ...(body.email !== undefined && { email: body.email }),
    ...(body.phone !== undefined && { phone: body.phone }),
  });
  return NextResponse.json(updated);
}

import { NextResponse } from "next/server";
import { repo } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const matterId = new URL(req.url).searchParams.get("matterId") ?? undefined;
  const invoices = repo.invoices(matterId).map((i) => ({
    ...i,
    matterName: repo.matter(i.matterId)?.name ?? "",
    clientName: repo.client(i.clientId)?.name ?? "",
  }));
  return NextResponse.json(invoices);
}

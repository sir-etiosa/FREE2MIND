import { NextResponse } from "next/server";
import { repo } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const users = repo.users();
  const clients = repo.clients();
  const matters = repo.matters().map((m) => ({
    ...m,
    clientName: clients.find((c) => c.id === m.clientId)?.name ?? "Unknown",
    attorney: users.find((u) => u.id === m.responsibleAttorneyId)?.name ?? "Unknown",
  }));
  return NextResponse.json(matters);
}

import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const matterId = searchParams.get("matterId") ?? undefined;
  const completeParam = searchParams.get("complete");
  const opts: { matterId?: string; complete?: boolean } = {};
  if (matterId) opts.matterId = matterId;
  if (completeParam !== null) opts.complete = completeParam === "true";

  const tasks = repo.tasks(opts);
  // Enrich with matter name + assignee name
  const matters = repo.matters();
  const users = repo.users();
  const enriched = tasks.map((t) => ({
    ...t,
    matterName: t.matterId ? (matters.find((m) => m.id === t.matterId)?.name ?? "") : "",
    assigneeName: users.find((u) => u.id === t.assigneeId)?.name ?? "",
    assigneeInitials: users.find((u) => u.id === t.assigneeId)?.initials ?? "",
  }));
  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const task = repo.addTask({
    title: body.title,
    matterId: body.matterId ?? null,
    assigneeId: body.assigneeId,
    dueDate: body.dueDate ?? null,
    priority: body.priority ?? "normal",
  });
  return NextResponse.json(task, { status: 201 });
}

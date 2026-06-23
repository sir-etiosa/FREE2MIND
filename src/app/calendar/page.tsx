"use client";

import { useEffect, useState } from "react";
import { PageHead, Spinner, Empty } from "@/components/ui";

interface Deadline {
  id: string;
  matterId: string;
  title: string;
  dueDate: string;
  complete: boolean;
  reminders: number[];
  matterName: string;
  clientName: string;
}

type FilterTab = "all" | "overdue" | "upcoming";

function relDays(dueDate: string): string {
  const diff = Math.round((new Date(dueDate).getTime() - Date.now()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  return `In ${diff} days`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function CalendarPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FilterTab>("all");

  useEffect(() => {
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((data) => { setDeadlines(data); setLoading(false); });
  }, []);

  async function markComplete(id: string) {
    const res = await fetch(`/api/calendar/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complete: true }),
    });
    if (res.ok) {
      setDeadlines((prev) =>
        prev.map((d) => (d.id === id ? { ...d, complete: true } : d))
      );
    }
  }

  const now = new Date().toISOString();
  const filtered = deadlines.filter((d) => {
    if (tab === "overdue") return !d.complete && d.dueDate < now;
    if (tab === "upcoming") return !d.complete && d.dueDate >= now;
    return true;
  });

  const overdue = filtered.filter((d) => !d.complete && d.dueDate < now);
  const upcoming = filtered.filter((d) => !d.complete && d.dueDate >= now);
  const completed = filtered.filter((d) => d.complete);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "overdue", label: "Overdue" },
    { key: "upcoming", label: "Upcoming" },
  ];

  function DeadlineRow({ d }: { d: Deadline }) {
    const isOver = !d.complete && d.dueDate < now;
    return (
      <div className={`flex items-start gap-4 border-l-2 py-3 pl-4 ${isOver ? "border-danger" : d.complete ? "border-line" : "border-positive"}`}>
        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${isOver ? "bg-danger" : d.complete ? "bg-line" : "bg-positive"}`} />
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${d.complete ? "text-muted line-through" : "text-ink"}`}>{d.title}</p>
          {d.matterName && <p className="mt-0.5 text-xs text-muted">{d.matterName}{d.clientName ? ` · ${d.clientName}` : ""}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-medium text-ink">{formatDate(d.dueDate)}</p>
            <p className={`text-[11px] ${isOver ? "text-danger" : "text-muted"}`}>{relDays(d.dueDate)}</p>
          </div>
          {!d.complete && (
            <button
              onClick={() => markComplete(d.id)}
              className="btn-ghost px-3 py-1 text-xs"
            >
              Mark complete
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHead eyebrow="Firm calendar" title="Calendar" />

      {/* Filter tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-line bg-surface p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              tab === t.key ? "bg-nebula text-white shadow-card" : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 && completed.length === 0 ? (
        <Empty title="No deadlines" hint="Add deadlines from a matter to see them here." />
      ) : (
        <div className="space-y-6">
          {(tab === "all" || tab === "overdue") && overdue.length > 0 && (
            <div className="card p-6">
              <h2 className="mb-4 font-display text-sm font-semibold text-danger">Overdue</h2>
              <div className="space-y-1 divide-y divide-line">
                {overdue.map((d) => <DeadlineRow key={d.id} d={d} />)}
              </div>
            </div>
          )}

          {(tab === "all" || tab === "upcoming") && upcoming.length > 0 && (
            <div className="card p-6">
              <h2 className="mb-4 font-display text-sm font-semibold text-ink">Upcoming</h2>
              <div className="space-y-1 divide-y divide-line">
                {upcoming.map((d) => <DeadlineRow key={d.id} d={d} />)}
              </div>
            </div>
          )}

          {tab === "all" && completed.length > 0 && (
            <div className="card p-6">
              <h2 className="mb-4 font-display text-sm font-semibold text-muted">Completed</h2>
              <div className="space-y-1 divide-y divide-line">
                {completed.map((d) => <DeadlineRow key={d.id} d={d} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { PageHead, Spinner, Empty } from "@/components/ui";

interface TaskRecord {
  id: string;
  title: string;
  matterId: string | null;
  assigneeId: string;
  dueDate: string | null;
  complete: boolean;
  priority: "low" | "normal" | "high";
  createdAt: string;
  completedAt: string | null;
  matterName: string;
  assigneeName: string;
  assigneeInitials: string;
}

interface Matter {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  initials: string;
}

type FilterTab = "all" | "open" | "completed";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-danger",
  normal: "bg-sky",
  low: "bg-muted",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FilterTab>("all");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    matterId: "",
    assigneeId: "",
    priority: "normal" as "low" | "normal" | "high",
    dueDate: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/matters").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()).then((d) => d.users),
    ]).then(([tasksData, mattersData, usersData]) => {
      setTasks(tasksData);
      setMatters(mattersData);
      setUsers(usersData ?? []);
      setLoading(false);
    });
  }, []);

  async function toggleTask(id: string) {
    const res = await fetch(`/api/tasks/${id}`, { method: "PATCH" });
    if (res.ok) {
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, complete: updated.complete, completedAt: updated.completedAt } : t)));
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.assigneeId) return;
    setSaving(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        matterId: form.matterId || null,
        assigneeId: form.assigneeId,
        priority: form.priority,
        dueDate: form.dueDate || null,
      }),
    });
    if (res.ok) {
      const newTask = await res.json();
      const matter = matters.find((m) => m.id === newTask.matterId);
      const user = users.find((u) => u.id === newTask.assigneeId);
      setTasks((prev) => [
        ...prev,
        {
          ...newTask,
          matterName: matter?.name ?? "",
          assigneeName: user?.name ?? "",
          assigneeInitials: user?.initials ?? "",
        },
      ]);
      setForm({ title: "", matterId: "", assigneeId: "", priority: "normal", dueDate: "" });
    }
    setSaving(false);
  }

  const filtered = tasks.filter((t) => {
    if (tab === "open") return !t.complete;
    if (tab === "completed") return t.complete;
    return true;
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "open", label: "Open" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div>
      <PageHead eyebrow="Work queue" title="Tasks" />

      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Task list */}
        <div>
          {/* Filter tabs */}
          <div className="mb-4 flex gap-1 rounded-xl border border-line bg-surface p-1 w-fit">
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
          ) : filtered.length === 0 ? (
            <Empty title="No tasks" hint="Create a task using the form on the right." />
          ) : (
            <div className="space-y-2">
              {filtered.map((task) => (
                <div key={task.id} className="card flex items-start gap-4 px-5 py-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
                      task.complete
                        ? "border-positive bg-positive text-white"
                        : "border-line hover:border-positive"
                    }`}
                    aria-label={task.complete ? "Mark incomplete" : "Mark complete"}
                  >
                    {task.complete && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </button>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${task.complete ? "text-muted line-through" : "text-ink"}`}>
                      {task.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {/* Priority dot */}
                      <span className="flex items-center gap-1 text-xs text-muted">
                        <span className={`h-2 w-2 rounded-full ${PRIORITY_DOT[task.priority]}`} />
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-muted">Due {formatDate(task.dueDate)}</span>
                      )}
                      {task.matterName && (
                        <span className="text-xs text-muted">{task.matterName}</span>
                      )}
                    </div>
                  </div>

                  {/* Assignee avatar */}
                  <div
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-nebula-soft font-display text-xs font-semibold text-nebula"
                    title={task.assigneeName}
                  >
                    {task.assigneeInitials}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New task form */}
        <div className="card h-fit p-6">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">New task</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="field-label">Title</label>
              <input
                className="field"
                placeholder="Task description…"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="field-label">Matter (optional)</label>
              <select
                className="field"
                value={form.matterId}
                onChange={(e) => setForm((f) => ({ ...f, matterId: e.target.value }))}
              >
                <option value="">— None —</option>
                {matters.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Assignee</label>
              <select
                className="field"
                value={form.assigneeId}
                onChange={(e) => setForm((f) => ({ ...f, assigneeId: e.target.value }))}
                required
              >
                <option value="">— Select —</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Priority</label>
              <select
                className="field"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as "low" | "normal" | "high" }))}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="field-label">Due date</label>
              <input
                type="date"
                className="field"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              {saving ? "Creating…" : "Create task"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

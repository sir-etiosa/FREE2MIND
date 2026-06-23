"use client";

import { useEffect, useState } from "react";
import { PageHead, Spinner } from "@/components/ui";

interface Firm {
  id: string;
  name: string;
  logoText: string;
  email: string;
  phone: string;
}

interface User {
  id: string;
  name: string;
  initials: string;
  role: "Attorney" | "Staff";
  defaultRateCents: number;
}

const ROLE_TONE: Record<string, string> = {
  Attorney: "bg-nebula-soft text-nebula",
  Staff: "bg-sky-soft text-sky-deep",
};

export default function SettingsPage() {
  const [firm, setFirm] = useState<Firm | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setFirm(d.firm);
        setUsers(d.users ?? []);
        setForm({ name: d.firm.name, email: d.firm.email, phone: d.firm.phone });
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const updated = await res.json();
      setFirm(updated);
      setSuccessMsg("Firm details saved successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    }
    setSaving(false);
  }

  if (loading) return <div><PageHead eyebrow="Configuration" title="Settings" /><Spinner /></div>;

  return (
    <div>
      <PageHead eyebrow="Configuration" title="Settings" />

      <div className="space-y-6">
        {/* Firm details */}
        <div className="card p-6">
          <h2 className="mb-5 font-display text-base font-semibold text-ink">Firm details</h2>
          <form onSubmit={handleSave} className="max-w-lg space-y-4">
            <div>
              <label className="field-label">Firm name</label>
              <input
                className="field"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                className="field"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input
                className="field"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-4 pt-2">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
              {successMsg && (
                <span className="text-sm font-medium text-positive">{successMsg}</span>
              )}
            </div>
          </form>
        </div>

        {/* Team */}
        <div className="card overflow-hidden">
          <div className="border-b border-line px-6 py-4">
            <h2 className="font-display text-base font-semibold text-ink">Team</h2>
            <p className="mt-0.5 text-sm text-muted">{users.length} team member{users.length !== 1 ? "s" : ""}</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-canvas/50 text-left">
                <th className="px-6 py-3 font-medium text-muted">Name</th>
                <th className="px-6 py-3 font-medium text-muted">Role</th>
                <th className="px-6 py-3 text-right font-medium text-muted">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-nebula-soft font-display text-sm font-semibold text-nebula">
                        {u.initials}
                      </div>
                      <span className="font-medium text-ink">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`pill ${ROLE_TONE[u.role] ?? "bg-muted/10 text-muted"}`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm text-ink">
                    ${(u.defaultRateCents / 100).toFixed(0)}/hr
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

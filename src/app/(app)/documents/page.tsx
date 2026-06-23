"use client";

import { useEffect, useState } from "react";
import { PageHead, Spinner, Empty } from "@/components/ui";

interface DocRecord {
  id: string;
  matterId: string | null;
  clientId: string | null;
  name: string;
  folder: string;
  tags: string[];
  sizeBytes: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  matterName: string;
}

interface Matter {
  id: string;
  name: string;
}

const FOLDERS = ["Pleadings", "Correspondence", "Discovery", "Signed Documents"];

function formatSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${Math.round(bytes / 1000)} KB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType === "application/pdf") {
    return <span className="text-base leading-none text-danger">📄</span>;
  }
  return <span className="text-base leading-none text-sky">📝</span>;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    folder: "Pleadings",
    matterId: "",
    tags: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/documents").then((r) => r.json()),
      fetch("/api/matters").then((r) => r.json()),
    ]).then(([docsData, mattersData]) => {
      setDocs(docsData);
      setMatters(mattersData);
      setLoading(false);
    });
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const isPdf = form.name.toLowerCase().endsWith(".pdf");
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        folder: form.folder,
        matterId: form.matterId || null,
        clientId: null,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        sizeBytes: Math.floor(Math.random() * 400_000) + 50_000,
        mimeType: isPdf ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        uploadedBy: "Jordan Hale",
      }),
    });
    if (res.ok) {
      const doc = await res.json();
      const matter = matters.find((m) => m.id === doc.matterId);
      setDocs((prev) => [...prev, { ...doc, matterName: matter?.name ?? "" }]);
      setForm({ name: "", folder: "Pleadings", matterId: "", tags: "" });
      setShowForm(false);
    }
    setSaving(false);
  }

  // Group by folder
  const byFolder: Record<string, DocRecord[]> = {};
  for (const doc of docs) {
    if (!byFolder[doc.folder]) byFolder[doc.folder] = [];
    byFolder[doc.folder].push(doc);
  }

  return (
    <div>
      <PageHead
        eyebrow="Document library"
        title="Documents"
        action={
          <button onClick={() => setShowForm((v) => !v)} className="btn-primary">
            {showForm ? "Cancel" : "Upload document"}
          </button>
        }
      />

      {showForm && (
        <div className="card mb-6 p-6">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Add document</h2>
          <form onSubmit={handleUpload} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="field-label">File name</label>
              <input
                className="field"
                placeholder="e.g. Motion to Compel.pdf"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="field-label">Folder</label>
              <select
                className="field"
                value={form.folder}
                onChange={(e) => setForm((f) => ({ ...f, folder: e.target.value }))}
              >
                {FOLDERS.map((fl) => <option key={fl}>{fl}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Matter (optional)</label>
              <select
                className="field"
                value={form.matterId}
                onChange={(e) => setForm((f) => ({ ...f, matterId: e.target.value }))}
              >
                <option value="">— No matter —</option>
                {matters.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="field-label">Tags (comma-separated)</label>
              <input
                className="field"
                placeholder="e.g. motion, discovery"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              />
            </div>
            <div className="col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save document"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : docs.length === 0 ? (
        <Empty title="No documents yet" hint="Upload your first document using the button above." />
      ) : (
        <div className="space-y-6">
          {Object.entries(byFolder).map(([folder, folderDocs]) => (
            <div key={folder} className="card overflow-hidden">
              <div className="border-b border-line bg-canvas/60 px-6 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">{folder}</p>
              </div>
              <div className="divide-y divide-line">
                {folderDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-4 px-6 py-3">
                    <FileIcon mimeType={doc.mimeType} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{doc.name}</p>
                      {doc.matterName && (
                        <p className="mt-0.5 truncate text-xs text-muted">{doc.matterName}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-6">
                      <span className="text-xs text-muted">{formatSize(doc.sizeBytes)}</span>
                      <span className="text-xs text-muted">{doc.uploadedBy}</span>
                      <span className="text-xs text-muted">{formatDate(doc.uploadedAt)}</span>
                      {doc.version > 1 && (
                        <span className="pill bg-nebula-soft text-nebula">v{doc.version}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

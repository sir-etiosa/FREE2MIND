import type {
  Client,
  Deadline,
  Document,
  Firm,
  FixedCharge,
  Invoice,
  Lead,
  Matter,
  MatterSummary,
  Note,
  Task,
  TimeEntry,
  TimelineEvent,
  TimelineKind,
  TrustAccount,
  TrustTransaction,
  User,
} from "./types";

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------
// MVP store: a module-level singleton kept on globalThis so it survives Next.js
// hot-reloads in dev and is shared between route handlers and pages in the same
// Node process. Data resets when the server process restarts.
//
// PRODUCTION SWAP: replace the bodies of the exported functions below with
// Prisma/Postgres queries. Nothing outside this file touches the data directly,
// so the API + UI layers stay unchanged.
// ---------------------------------------------------------------------------

interface DB {
  firm: Firm;
  users: User[];
  leads: Lead[];
  clients: Client[];
  matters: Matter[];
  timeline: TimelineEvent[];
  notes: Note[];
  timeEntries: TimeEntry[];
  fixedCharges: FixedCharge[];
  invoices: Invoice[];
  deadlines: Deadline[];
  documents: Document[];
  tasks: Task[];
  accounts: TrustAccount[];
  transactions: TrustTransaction[];
  seq: number;
}

const DB_VERSION = 2; // bump this when DB shape changes to force re-seed
const g = globalThis as unknown as { __m2m?: DB; __m2m_v?: number };

const dollars = (n: number) => Math.round(n * 100);
const daysFromNow = (d: number) =>
  new Date(Date.now() + d * 86_400_000).toISOString();

function seed(): DB {
  const firm: Firm = {
    id: "firm_1",
    name: "Hale & Vance Law",
    logoText: "HV",
    email: "office@halevance.law",
    phone: "(415) 555-0142",
  };

  const users: User[] = [
    { id: "u_jh", name: "Jordan Hale", initials: "JH", role: "Attorney", defaultRateCents: dollars(395) },
    { id: "u_pv", name: "Priya Vance", initials: "PV", role: "Attorney", defaultRateCents: dollars(425) },
    { id: "u_ms", name: "Marcus Soto", initials: "MS", role: "Staff", defaultRateCents: dollars(165) },
  ];

  const leads: Lead[] = [
    {
      id: "lead_1", name: "Dana Whitfield", email: "dana.w@example.com", phone: "(415) 555-0190",
      matterDescription: "Uncontested divorce, two minor children.", opposingParties: ["Eric Whitfield"],
      referralSource: "Google search", status: "New", createdAt: daysFromNow(-2), conflictFlag: null,
    },
    {
      id: "lead_2", name: "Northgate Ventures LLC", email: "ops@northgate.example", phone: "(415) 555-0177",
      matterDescription: "Commercial lease dispute with prior tenant.", opposingParties: ["Coastline Property Group"],
      referralSource: "Referral — M. Okafor", status: "Contacted", createdAt: daysFromNow(-5), conflictFlag: null,
    },
    {
      id: "lead_3", name: "Sam Reyes", email: "sreyes@example.com", phone: "(415) 555-0123",
      matterDescription: "Estate plan: will + revocable trust.", opposingParties: [],
      referralSource: "Existing client referral", status: "Engagement Sent", createdAt: daysFromNow(-3), conflictFlag: null,
    },
    {
      id: "lead_4", name: "Coastline Property Group", email: "legal@coastline.example", phone: "(415) 555-0166",
      matterDescription: "Wants representation re: tenant build-out claim.", opposingParties: ["Northgate Ventures LLC"],
      referralSource: "Website form", status: "New", createdAt: daysFromNow(-1),
      conflictFlag: "Opposing party \u201cNorthgate Ventures LLC\u201d matches an existing lead (lead_2). Resolve before accepting.",
    },
  ];

  const clients: Client[] = [
    { id: "cl_1", leadId: "lead_x1", name: "Helen Marsh", email: "helen.marsh@example.com", phone: "(415) 555-0101", portalAccess: true, createdAt: daysFromNow(-40) },
    { id: "cl_2", leadId: "lead_x2", name: "Atlas Robotics Inc.", email: "legal@atlas.example", phone: "(415) 555-0102", portalAccess: true, createdAt: daysFromNow(-22) },
  ];

  const matters: Matter[] = [
    {
      id: "mt_1", clientId: "cl_1", name: "Marsh v. Marsh — Dissolution", practiceArea: "Family Law",
      responsibleAttorneyId: "u_jh", status: "Active", openDate: daysFromNow(-40), closeDate: null,
      rateModel: "hourly", matterRateOverrideCents: null, practiceAreaRateCents: dollars(350),
      retainerAgreedCents: dollars(5000), retainerCollected: true, retainerCollectedCents: dollars(5000), retainerCollectedDate: daysFromNow(-39),
    },
    {
      id: "mt_2", clientId: "cl_2", name: "Atlas Robotics — Vendor MSA Review", practiceArea: "Corporate",
      responsibleAttorneyId: "u_pv", status: "Active", openDate: daysFromNow(-22), closeDate: null,
      rateModel: "hourly", matterRateOverrideCents: dollars(300), practiceAreaRateCents: dollars(450),
      retainerAgreedCents: dollars(7500), retainerCollected: false, retainerCollectedCents: 0, retainerCollectedDate: null,
    },
  ];

  const deadlines: Deadline[] = [
    { id: "dl_1", matterId: "mt_1", title: "File preliminary declaration of disclosure", dueDate: daysFromNow(-3), complete: false, reminders: [14, 7, 1] },
    { id: "dl_2", matterId: "mt_1", title: "Mediation session", dueDate: daysFromNow(9), complete: false, reminders: [7, 1] },
    { id: "dl_3", matterId: "mt_2", title: "Return redlined MSA to vendor", dueDate: daysFromNow(4), complete: false, reminders: [3, 1] },
  ];

  // Trust accounts
  const accounts: TrustAccount[] = [
    { id: "acct_1", name: "Hale & Vance Operating Account", type: "operating", balanceCents: dollars(48320) },
    { id: "acct_2", name: "Hale & Vance IOLTA Trust Account", type: "trust", balanceCents: dollars(12500) },
  ];

  // Documents
  const documents: Document[] = [
    {
      id: "doc_1", matterId: "mt_1", clientId: "cl_1", name: "Petition for Dissolution of Marriage.pdf",
      folder: "Pleadings", tags: ["petition", "family-law"], sizeBytes: 245000, mimeType: "application/pdf",
      uploadedBy: "Jordan Hale", uploadedAt: daysFromNow(-38), version: 1,
    },
    {
      id: "doc_2", matterId: "mt_1", clientId: "cl_1", name: "Financial Disclosure Worksheet.docx",
      folder: "Signed Documents", tags: ["disclosure", "financial"], sizeBytes: 89000, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      uploadedBy: "Marcus Soto", uploadedAt: daysFromNow(-10), version: 2,
    },
    {
      id: "doc_3", matterId: "mt_1", clientId: "cl_1", name: "Correspondence — Opposing Counsel re Custody.pdf",
      folder: "Correspondence", tags: ["custody", "opposing-counsel"], sizeBytes: 62000, mimeType: "application/pdf",
      uploadedBy: "Jordan Hale", uploadedAt: daysFromNow(-6), version: 1,
    },
    {
      id: "doc_4", matterId: "mt_2", clientId: "cl_2", name: "Vendor MSA — Redlined v2.docx",
      folder: "Pleadings", tags: ["msa", "vendor", "redline"], sizeBytes: 412000, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      uploadedBy: "Priya Vance", uploadedAt: daysFromNow(-8), version: 2,
    },
    {
      id: "doc_5", matterId: "mt_2", clientId: "cl_2", name: "Scope Confirmation Email Thread.pdf",
      folder: "Correspondence", tags: ["scope", "email"], sizeBytes: 134000, mimeType: "application/pdf",
      uploadedBy: "Priya Vance", uploadedAt: daysFromNow(-4), version: 1,
    },
  ];

  // Tasks
  const tasks: Task[] = [
    {
      id: "task_1", title: "Prepare financial disclosure exhibits", matterId: "mt_1",
      assigneeId: "u_ms", dueDate: daysFromNow(2), complete: false, priority: "high",
      createdAt: daysFromNow(-7), completedAt: null,
    },
    {
      id: "task_2", title: "Schedule mediation session with opposing counsel", matterId: "mt_1",
      assigneeId: "u_jh", dueDate: daysFromNow(5), complete: false, priority: "normal",
      createdAt: daysFromNow(-5), completedAt: null,
    },
    {
      id: "task_3", title: "Review redlined MSA sections — indemnification", matterId: "mt_2",
      assigneeId: "u_pv", dueDate: daysFromNow(3), complete: false, priority: "high",
      createdAt: daysFromNow(-3), completedAt: null,
    },
    {
      id: "task_4", title: "Send engagement letter to Sam Reyes", matterId: null,
      assigneeId: "u_jh", dueDate: daysFromNow(-1), complete: true, priority: "normal",
      createdAt: daysFromNow(-4), completedAt: daysFromNow(-1),
    },
    {
      id: "task_5", title: "Update conflict check database", matterId: null,
      assigneeId: "u_ms", dueDate: daysFromNow(7), complete: false, priority: "low",
      createdAt: daysFromNow(-2), completedAt: null,
    },
  ];

  // Trust transactions
  const transactions: TrustTransaction[] = [
    {
      id: "txn_1", accountId: "acct_2", matterId: "mt_1", clientId: "cl_1",
      type: "deposit", amountCents: dollars(5000),
      description: "Retainer deposit — Marsh v. Marsh",
      date: daysFromNow(-39), reference: "CHECK-1042",
    },
    {
      id: "txn_2", accountId: "acct_2", matterId: "mt_1", clientId: "cl_1",
      type: "withdrawal", amountCents: dollars(1750),
      description: "Fee earned transfer — Invoice INV-1001",
      date: daysFromNow(-15), reference: "WIRE-2024-001",
    },
    {
      id: "txn_3", accountId: "acct_1", matterId: "mt_2", clientId: "cl_2",
      type: "deposit", amountCents: dollars(7500),
      description: "Retainer deposit — Atlas Robotics MSA",
      date: daysFromNow(-20), reference: "ACH-88291",
    },
    {
      id: "txn_4", accountId: "acct_1", matterId: "mt_2", clientId: "cl_2",
      type: "withdrawal", amountCents: dollars(900),
      description: "Filing fee — UCC search",
      date: daysFromNow(-12), reference: null,
    },
  ];

  const db: DB = {
    firm, users, leads, clients, matters,
    timeline: [], notes: [], timeEntries: [], fixedCharges: [], invoices: [], deadlines,
    documents, tasks, accounts, transactions,
    seq: 1,
  };

  // Seed timeline + time entries through the real domain functions so logic stays consistent.
  const id = () => `sd_${db.seq++}`;
  db.timeline.push(
    { id: id(), matterId: "mt_1", kind: "system", summary: "Matter opened from signed engagement", actor: "System", at: daysFromNow(-40) },
    { id: id(), matterId: "mt_1", kind: "payment", summary: "Retainer collected — $5,000.00", actor: "System", at: daysFromNow(-39) },
    { id: id(), matterId: "mt_1", kind: "communication", summary: "Call with client re: disclosure timeline", actor: "Jordan Hale", at: daysFromNow(-6) },
    { id: id(), matterId: "mt_2", kind: "system", summary: "Matter opened from signed engagement", actor: "System", at: daysFromNow(-22) },
    { id: id(), matterId: "mt_2", kind: "communication", summary: "Email: scope confirmation sent to client", actor: "Priya Vance", at: daysFromNow(-4) },
  );

  // mt_1 hourly time entries (resolves to practice-area rate $350 — no matter override)
  pushTimeEntry(db, { matterId: "mt_1", userId: "u_jh", date: daysFromNow(-35), minutes: 90, clientFacing: "Initial case strategy and intake review", internalNote: "Client anxious about custody — keep tone measured." });
  pushTimeEntry(db, { matterId: "mt_1", userId: "u_jh", date: daysFromNow(-20), minutes: 150, clientFacing: "Draft and revise petition for dissolution", internalNote: null });
  pushTimeEntry(db, { matterId: "mt_1", userId: "u_ms", date: daysFromNow(-7), minutes: 45, clientFacing: "Assemble financial disclosure exhibits", internalNote: null });
  // mt_2 entries (resolves to matter override $300, NOT practice-area $450)
  pushTimeEntry(db, { matterId: "mt_2", userId: "u_pv", date: daysFromNow(-18), minutes: 120, clientFacing: "Review master services agreement, first pass", internalNote: null });
  pushTimeEntry(db, { matterId: "mt_2", userId: "u_pv", date: daysFromNow(-10), minutes: 75, clientFacing: "Mark up indemnification and liability sections", internalNote: "Vendor's cap is aggressive; push back." });

  // A finalized invoice on mt_1 covering its first two entries, with a partial payment.
  const inv = generateInvoice(db, "mt_1", daysFromNow(-45), daysFromNow(-15));
  if (inv) {
    finalizeInvoice(db, inv.id);
    recordPayment(db, inv.id, Math.round(inv.subtotalCents * 0.5));
  }

  return db;
}

function getDB(): DB {
  if (!g.__m2m || g.__m2m_v !== DB_VERSION) {
    g.__m2m = seed();
    g.__m2m_v = DB_VERSION;
  }
  return g.__m2m;
}

// ---------------------------------------------------------------------------
// Domain logic
// ---------------------------------------------------------------------------

function nextId(db: DB, prefix: string) {
  return `${prefix}_${db.seq++}`;
}

/** Section 6.1 — most specific rate wins: matter override > practice area > attorney default. */
export function resolveRate(db: DB, matter: Matter, userId: string): number {
  if (matter.matterRateOverrideCents != null) return matter.matterRateOverrideCents;
  if (matter.practiceAreaRateCents != null) return matter.practiceAreaRateCents;
  const u = db.users.find((x) => x.id === userId);
  return u?.defaultRateCents ?? 0;
}

export function addTimeline(db: DB, matterId: string, kind: TimelineKind, summary: string, actor: string): TimelineEvent {
  const ev: TimelineEvent = { id: nextId(db, "tl"), matterId, kind, summary, actor, at: new Date().toISOString() };
  db.timeline.push(ev); // append-only / immutable
  return ev;
}

function pushTimeEntry(
  db: DB,
  input: { matterId: string; userId: string; date: string; minutes: number; clientFacing: string; internalNote?: string | null }
): TimeEntry {
  const matter = db.matters.find((m) => m.id === input.matterId)!;
  const rateCents = resolveRate(db, matter, input.userId);
  const amountCents = matter.rateModel === "hourly" ? Math.round((input.minutes / 60) * rateCents) : 0;
  const entry: TimeEntry = {
    id: nextId(db, "te"), matterId: input.matterId, userId: input.userId, date: input.date,
    minutes: input.minutes, rateCents, amountCents, clientFacing: input.clientFacing,
    internalNote: input.internalNote ?? null, invoiceId: null,
  };
  db.timeEntries.push(entry);
  const u = db.users.find((x) => x.id === input.userId);
  db.timeline.push({
    id: nextId(db, "tl"), matterId: input.matterId, kind: "time",
    summary: `${(input.minutes / 60).toFixed(2)}h — ${input.clientFacing}`,
    actor: u?.name ?? "Unknown", at: input.date,
  });
  return entry;
}

/** Section 1.7 — summary is computed, never stored; always reflects most recent qualifying event. */
export function computeSummary(db: DB, matterId: string): MatterSummary {
  const matter = db.matters.find((m) => m.id === matterId)!;
  const events = db.timeline.filter((e) => e.matterId === matterId).sort((a, b) => b.at.localeCompare(a.at));
  const lastActivity = events[0]?.at ?? null;
  const lastComm = events.find((e) => e.kind === "communication") ?? null;
  const upcoming = db.deadlines
    .filter((d) => d.matterId === matterId && !d.complete)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  return {
    status: matter.status,
    retainerCollected: matter.retainerCollected,
    retainerAgreedCents: matter.retainerAgreedCents,
    retainerCollectedCents: matter.retainerCollectedCents,
    lastActivityAt: lastActivity,
    nextDeadline: upcoming ? { title: upcoming.title, dueDate: upcoming.dueDate } : null,
    lastClientContact: lastComm ? { at: lastComm.at, method: lastComm.summary } : null,
  };
}

/** Section 1.3 — conversion is triggered by the signature event. */
export function convertLead(db: DB, leadId: string, practiceArea: string): { client: Client; matter: Matter } | null {
  const lead = db.leads.find((l) => l.id === leadId);
  if (!lead || lead.status === "Converted") return null;

  const client: Client = {
    id: nextId(db, "cl"), leadId: lead.id, name: lead.name, email: lead.email,
    phone: lead.phone, portalAccess: true, createdAt: new Date().toISOString(),
  };
  db.clients.push(client);

  const matter: Matter = {
    id: nextId(db, "mt"), clientId: client.id,
    name: `${lead.name} — ${lead.matterDescription.slice(0, 40)}`,
    practiceArea, responsibleAttorneyId: db.users[0].id, status: "Active",
    openDate: new Date().toISOString(), closeDate: null, rateModel: "hourly",
    matterRateOverrideCents: null, practiceAreaRateCents: null,
    retainerAgreedCents: 0, retainerCollected: false, retainerCollectedCents: 0, retainerCollectedDate: null,
  };
  db.matters.push(matter);

  lead.status = "Converted";
  addTimeline(db, matter.id, "system", "Matter opened — engagement letter signed (Lead converted to Client)", "System");
  return { client, matter };
}

/** Section 6.4 — pull unbilled time entries + billable fixed charges in range into a Draft invoice. */
export function generateInvoice(db: DB, matterId: string, from: string, to: string): Invoice | null {
  const matter = db.matters.find((m) => m.id === matterId);
  if (!matter) return null;

  const times = db.timeEntries.filter(
    (t) => t.matterId === matterId && !t.invoiceId && t.amountCents > 0 && t.date >= from && t.date <= to
  );
  const fixed = db.fixedCharges.filter((f) => f.matterId === matterId && !f.invoiceId && f.billable);
  if (times.length === 0 && fixed.length === 0) return null;

  const lines = [
    ...times.map((t) => ({
      kind: "time" as const, description: t.clientFacing, date: t.date,
      minutes: t.minutes, rateCents: t.rateCents, amountCents: t.amountCents,
    })),
    ...fixed.map((f) => ({ kind: "fixed" as const, description: f.clientFacing, amountCents: f.amountCents })),
  ];
  const subtotalCents = lines.reduce((s, l) => s + l.amountCents, 0);
  const n = db.invoices.length + 1001;

  const invoice: Invoice = {
    id: nextId(db, "inv"), number: `INV-${n}`, matterId, clientId: matter.clientId,
    status: "Draft", issuedDate: new Date().toISOString(), dueDate: daysFromNow(30),
    lines, subtotalCents, paidCents: 0,
  };
  db.invoices.push(invoice);
  times.forEach((t) => (t.invoiceId = invoice.id));
  fixed.forEach((f) => (f.invoiceId = invoice.id));
  return invoice;
}

/** Finalizing locks the invoice (Section 6.4). */
export function finalizeInvoice(db: DB, invoiceId: string): Invoice | null {
  const inv = db.invoices.find((i) => i.id === invoiceId);
  if (!inv || inv.status !== "Draft") return null;
  inv.status = "Sent";
  inv.dueDate = daysFromNow(30);
  addTimeline(db, inv.matterId, "invoice", `Invoice ${inv.number} sent — $${(inv.subtotalCents / 100).toFixed(2)}`, "System");
  return inv;
}

export function recordPayment(db: DB, invoiceId: string, amountCents: number): Invoice | null {
  const inv = db.invoices.find((i) => i.id === invoiceId);
  if (!inv) return null;
  inv.paidCents = Math.min(inv.subtotalCents, inv.paidCents + amountCents);
  inv.status = inv.paidCents >= inv.subtotalCents ? "Paid" : "Partially Paid";
  addTimeline(db, inv.matterId, "payment", `Payment received — $${(amountCents / 100).toFixed(2)} on ${inv.number}`, "System");
  return inv;
}

function isOverdue(inv: Invoice): boolean {
  return (inv.status === "Sent" || inv.status === "Partially Paid") &&
    inv.dueDate < new Date().toISOString() && inv.paidCents < inv.subtotalCents;
}

// ---------------------------------------------------------------------------
// Public repository API used by route handlers
// ---------------------------------------------------------------------------

export const repo = {
  firm: () => getDB().firm,
  updateFirm: (fields: Partial<Pick<Firm, "name" | "email" | "phone">>) => {
    const db = getDB();
    Object.assign(db.firm, fields);
    return db.firm;
  },
  users: () => getDB().users,

  leads: () => getDB().leads,
  lead: (id: string) => getDB().leads.find((l) => l.id === id) ?? null,
  setLeadStatus: (id: string, status: Lead["status"]) => {
    const l = repo.lead(id);
    if (l) l.status = status;
    return l;
  },
  convert: (leadId: string, practiceArea: string) => convertLead(getDB(), leadId, practiceArea),

  clients: () => getDB().clients,
  client: (id: string) => getDB().clients.find((c) => c.id === id) ?? null,

  matters: () => getDB().matters,
  matter: (id: string) => getDB().matters.find((m) => m.id === id) ?? null,
  summary: (id: string) => computeSummary(getDB(), id),
  timeline: (matterId: string) =>
    getDB().timeline.filter((e) => e.matterId === matterId).sort((a, b) => b.at.localeCompare(a.at)),
  notes: (matterId: string) =>
    getDB().notes.filter((n) => n.matterId === matterId).sort((a, b) => b.at.localeCompare(a.at)),
  addNote: (matterId: string, body: string, tag: string | null, author: string) => {
    const db = getDB();
    const note: Note = { id: nextId(db, "note"), matterId, body, tag, author, at: new Date().toISOString() };
    db.notes.push(note);
    addTimeline(db, matterId, "note", tag ? `Note (${tag}): ${body.slice(0, 60)}` : `Note: ${body.slice(0, 60)}`, author);
    return note;
  },

  timeEntries: (matterId?: string) => {
    const all = getDB().timeEntries;
    return matterId ? all.filter((t) => t.matterId === matterId) : all;
  },
  addTimeEntry: (input: { matterId: string; userId: string; date: string; minutes: number; clientFacing: string; internalNote?: string | null }) =>
    pushTimeEntry(getDB(), input),

  fixedCharges: (matterId?: string) => {
    const all = getDB().fixedCharges;
    return matterId ? all.filter((f) => f.matterId === matterId) : all;
  },
  addFixedCharge: (input: { matterId: string; amountCents: number; clientFacing: string; internalNote?: string | null; billable: boolean }) => {
    const db = getDB();
    const fc: FixedCharge = { id: nextId(db, "fc"), invoiceId: null, ...input, internalNote: input.internalNote ?? null };
    db.fixedCharges.push(fc);
    addTimeline(db, input.matterId, "system", `Fixed charge added — $${(input.amountCents / 100).toFixed(2)} (${input.billable ? "billable" : "non-billable"})`, "System");
    return fc;
  },

  invoices: (matterId?: string) => {
    const all = getDB().invoices.map((i) => ({ ...i, status: isOverdue(i) ? ("Overdue" as const) : i.status }));
    return matterId ? all.filter((i) => i.matterId === matterId) : all;
  },
  invoice: (id: string) => repo.invoices().find((i) => i.id === id) ?? null,
  generateInvoice: (matterId: string, from: string, to: string) => generateInvoice(getDB(), matterId, from, to),
  finalizeInvoice: (id: string) => finalizeInvoice(getDB(), id),
  recordPayment: (id: string, amountCents: number) => recordPayment(getDB(), id, amountCents),

  deadlines: (matterId?: string) => {
    const all = getDB().deadlines;
    return matterId ? all.filter((d) => d.matterId === matterId) : all;
  },
  allDeadlines: () => {
    const db = getDB();
    return db.deadlines.map((d) => {
      const matter = db.matters.find((m) => m.id === d.matterId);
      const client = matter ? db.clients.find((c) => c.id === matter.clientId) : null;
      return {
        ...d,
        matterName: matter?.name ?? "",
        clientName: client?.name ?? "",
      };
    }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  },
  completeDeadline: (id: string) => {
    const db = getDB();
    const d = db.deadlines.find((x) => x.id === id);
    if (d) d.complete = true;
    return d ?? null;
  },

  // Documents
  documents: (matterId?: string) => {
    const all = getDB().documents;
    return matterId ? all.filter((d) => d.matterId === matterId) : all;
  },
  addDocument: (input: {
    matterId: string | null;
    clientId: string | null;
    name: string;
    folder: string;
    tags: string[];
    sizeBytes: number;
    mimeType: string;
    uploadedBy: string;
  }) => {
    const db = getDB();
    const doc: Document = {
      id: nextId(db, "doc"),
      ...input,
      uploadedAt: new Date().toISOString(),
      version: 1,
    };
    db.documents.push(doc);
    return doc;
  },

  // Tasks
  tasks: (opts?: { matterId?: string; complete?: boolean }) => {
    let all = getDB().tasks;
    if (opts?.matterId !== undefined) all = all.filter((t) => t.matterId === opts.matterId);
    if (opts?.complete !== undefined) all = all.filter((t) => t.complete === opts.complete);
    return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
  addTask: (input: {
    title: string;
    matterId: string | null;
    assigneeId: string;
    dueDate: string | null;
    priority: "low" | "normal" | "high";
  }) => {
    const db = getDB();
    const task: Task = {
      id: nextId(db, "task"),
      ...input,
      complete: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    db.tasks.push(task);
    return task;
  },
  completeTask: (id: string) => {
    const db = getDB();
    const task = db.tasks.find((t) => t.id === id);
    if (task) {
      task.complete = !task.complete;
      task.completedAt = task.complete ? new Date().toISOString() : null;
    }
    return task ?? null;
  },

  // Accounts
  accounts: () => getDB().accounts,
  addAccount: (input: { name: string; type: "operating" | "trust" }) => {
    const db = getDB();
    const acct: TrustAccount = {
      id: nextId(db, "acct"),
      ...input,
      balanceCents: 0,
    };
    db.accounts.push(acct);
    return acct;
  },

  // Transactions
  transactions: (accountId?: string) => {
    const all = getDB().transactions;
    return accountId ? all.filter((t) => t.accountId === accountId) : all;
  },
  addTransaction: (input: {
    accountId: string;
    matterId: string | null;
    clientId: string | null;
    type: "deposit" | "withdrawal";
    amountCents: number;
    description: string;
    reference: string | null;
  }) => {
    const db = getDB();
    const txn: TrustTransaction = {
      id: nextId(db, "txn"),
      ...input,
      date: new Date().toISOString(),
    };
    db.transactions.push(txn);
    // Update account balance
    const acct = db.accounts.find((a) => a.id === input.accountId);
    if (acct) {
      if (input.type === "deposit") acct.balanceCents += input.amountCents;
      else acct.balanceCents -= input.amountCents;
    }
    return txn;
  },

  // Section 11 — firm dashboard is a live query view, stores nothing of its own.
  dashboard: () => {
    const db = getDB();
    const now = new Date().toISOString();
    const overdueDeadlines = db.deadlines
      .filter((d) => !d.complete && d.dueDate < now)
      .map((d) => ({ ...d, matterName: db.matters.find((m) => m.id === d.matterId)?.name ?? "" }))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const overdueInvoices = repo.invoices().filter((i) => i.status === "Overdue");
    const retainerGap = db.matters.filter(
      (m) => !m.retainerCollected && db.timeEntries.some((t) => t.matterId === m.id)
    );
    const STALE_DAYS = 14;
    const staleMatters = db.matters.filter((m) => {
      if (m.status === "Closed") return false;
      const last = db.timeline.filter((e) => e.matterId === m.id).sort((a, b) => b.at.localeCompare(a.at))[0];
      return !last || last.at < daysFromNow(-STALE_DAYS);
    });
    const pendingLeads = db.leads.filter((l) => l.status === "New" || l.status === "Contacted");
    return { overdueDeadlines, overdueInvoices, retainerGap, staleMatters, pendingLeads, staleDays: STALE_DAYS };
  },
};

export { dollars };

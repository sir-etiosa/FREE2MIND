// Domain model for Mind2Matter. Mirrors the feature/logic spec.
// All money is stored in integer cents to avoid float drift.

export type ID = string;

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Engagement Sent"
  | "Converted"
  | "Declined"
  | "Lost";

export type MatterStatus =
  | "Intake"
  | "Active"
  | "Awaiting Client"
  | "Closed";

export type RateModel = "hourly" | "flat" | "contingency";

export type InvoiceStatus =
  | "Draft"
  | "Sent"
  | "Paid"
  | "Partially Paid"
  | "Overdue";

export type TimelineKind =
  | "status"
  | "note"
  | "document"
  | "event"
  | "communication"
  | "time"
  | "payment"
  | "invoice"
  | "system";

export interface Firm {
  id: ID;
  name: string;
  logoText: string; // monogram for MVP branding
  email: string;
  phone: string;
}

export interface User {
  id: ID;
  name: string;
  initials: string;
  role: "Attorney" | "Staff";
  defaultRateCents: number; // firm-wide default billing rate (per hour)
}

export interface Lead {
  id: ID;
  name: string;
  email: string;
  phone: string;
  matterDescription: string;
  opposingParties: string[];
  referralSource: string;
  status: LeadStatus;
  createdAt: string;
  conflictFlag?: string | null; // populated if an opposing-party match was found
}

export interface Client {
  id: ID;
  leadId: ID;
  name: string;
  email: string;
  phone: string;
  portalAccess: boolean;
  createdAt: string;
}

export interface Matter {
  id: ID;
  clientId: ID;
  name: string;
  practiceArea: string;
  responsibleAttorneyId: ID;
  status: MatterStatus;
  openDate: string;
  closeDate?: string | null;
  rateModel: RateModel;
  // rate resolution inputs (Section 6.1)
  matterRateOverrideCents?: number | null;
  practiceAreaRateCents?: number | null;
  // retainer tracking (Section 1.5)
  retainerAgreedCents: number;
  retainerCollected: boolean;
  retainerCollectedCents: number;
  retainerCollectedDate?: string | null;
}

export interface TimelineEvent {
  id: ID;
  matterId: ID;
  kind: TimelineKind;
  summary: string;
  actor: string;
  at: string; // ISO timestamp — immutable once created
}

export interface Note {
  id: ID;
  matterId: ID;
  body: string;
  tag?: string | null;
  author: string;
  at: string;
}

export interface TimeEntry {
  id: ID;
  matterId: ID;
  userId: ID;
  date: string;
  minutes: number;
  rateCents: number; // resolved + frozen at entry time (Section 6.1)
  amountCents: number; // minutes/60 * rate, computed at entry time
  clientFacing: string; // shown on invoice + portal
  internalNote?: string | null; // firm-only, never leaves the firm
  invoiceId?: ID | null; // set once billed
}

export interface FixedCharge {
  id: ID;
  matterId: ID;
  amountCents: number;
  clientFacing: string;
  internalNote?: string | null;
  billable: boolean;
  invoiceId?: ID | null;
}

export interface InvoiceLine {
  kind: "time" | "fixed";
  description: string;
  date?: string;
  minutes?: number;
  rateCents?: number;
  amountCents: number;
}

export interface Invoice {
  id: ID;
  number: string;
  matterId: ID;
  clientId: ID;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
  lines: InvoiceLine[];
  subtotalCents: number;
  paidCents: number;
}

export interface Deadline {
  id: ID;
  matterId: ID;
  title: string;
  dueDate: string;
  complete: boolean;
  reminders: number[]; // days before
}

// Computed (never stored) — Section 1.7
export interface MatterSummary {
  status: MatterStatus;
  retainerCollected: boolean;
  retainerAgreedCents: number;
  retainerCollectedCents: number;
  lastActivityAt: string | null;
  nextDeadline: { title: string; dueDate: string } | null;
  lastClientContact: { at: string; method: string } | null;
}

export interface Document {
  id: ID;
  matterId: ID | null;
  clientId: ID | null;
  name: string;
  folder: string;
  tags: string[];
  sizeBytes: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
}

export interface Task {
  id: ID;
  title: string;
  matterId: ID | null;
  assigneeId: ID;
  dueDate: string | null;
  complete: boolean;
  priority: "low" | "normal" | "high";
  createdAt: string;
  completedAt: string | null;
}

export interface TrustAccount {
  id: ID;
  name: string;
  type: "operating" | "trust";
  balanceCents: number;
}

export interface TrustTransaction {
  id: ID;
  accountId: ID;
  matterId: ID | null;
  clientId: ID | null;
  type: "deposit" | "withdrawal";
  amountCents: number;
  description: string;
  date: string;
  reference: string | null;
}

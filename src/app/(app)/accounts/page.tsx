"use client";

import { useEffect, useState } from "react";
import { PageHead, Spinner, Empty } from "@/components/ui";

interface Account {
  id: string;
  name: string;
  type: "operating" | "trust";
  balanceCents: number;
}

interface Transaction {
  id: string;
  accountId: string;
  matterId: string | null;
  clientId: string | null;
  type: "deposit" | "withdrawal";
  amountCents: number;
  description: string;
  date: string;
  reference: string | null;
  matterName: string;
}

interface Matter {
  id: string;
  name: string;
}

function fmtMoney(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const TYPE_TONE: Record<string, string> = {
  operating: "bg-sky-soft text-sky-deep",
  trust: "bg-nebula-soft text-nebula",
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [txnsByAccount, setTxnsByAccount] = useState<Record<string, Transaction[]>>({});
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewAcct, setShowNewAcct] = useState(false);
  const [acctForm, setAcctForm] = useState({ name: "", type: "operating" as "operating" | "trust" });
  const [savingAcct, setSavingAcct] = useState(false);

  // Per-account transaction form state
  const [txnForms, setTxnForms] = useState<Record<string, { type: string; amountCents: string; description: string; matterId: string; reference: string }>>({});
  const [savingTxn, setSavingTxn] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/accounts").then((r) => r.json()),
      fetch("/api/matters").then((r) => r.json()),
    ]).then(async ([acctData, mattersData]: [Account[], Matter[]]) => {
      setAccounts(acctData);
      setMatters(mattersData);
      // Load transactions per account
      const txnMap: Record<string, Transaction[]> = {};
      await Promise.all(
        acctData.map(async (a) => {
          const txns = await fetch(`/api/accounts/${a.id}/transactions`).then((r) => r.json());
          txnMap[a.id] = txns;
        })
      );
      setTxnsByAccount(txnMap);
      setLoading(false);
    });
  }, []);

  function txnForm(accountId: string) {
    return txnForms[accountId] ?? { type: "deposit", amountCents: "", description: "", matterId: "", reference: "" };
  }

  function setTxnForm(accountId: string, patch: Partial<typeof txnForms[string]>) {
    setTxnForms((prev) => ({ ...prev, [accountId]: { ...txnForm(accountId), ...patch } }));
  }

  async function handleNewAccount(e: React.FormEvent) {
    e.preventDefault();
    setSavingAcct(true);
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(acctForm),
    });
    if (res.ok) {
      const acct = await res.json();
      setAccounts((prev) => [...prev, acct]);
      setTxnsByAccount((prev) => ({ ...prev, [acct.id]: [] }));
      setAcctForm({ name: "", type: "operating" });
      setShowNewAcct(false);
    }
    setSavingAcct(false);
  }

  async function handleAddTxn(e: React.FormEvent, accountId: string) {
    e.preventDefault();
    const f = txnForm(accountId);
    if (!f.description.trim() || !f.amountCents) return;
    setSavingTxn(accountId);
    const res = await fetch(`/api/accounts/${accountId}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: f.type,
        amountCents: Math.round(parseFloat(f.amountCents) * 100),
        description: f.description,
        matterId: f.matterId || null,
        clientId: null,
        reference: f.reference || null,
      }),
    });
    if (res.ok) {
      const txn = await res.json();
      const matter = matters.find((m) => m.id === txn.matterId);
      const enriched = { ...txn, matterName: matter?.name ?? "" };
      setTxnsByAccount((prev) => ({ ...prev, [accountId]: [...(prev[accountId] ?? []), enriched] }));
      // Refresh account balance
      const updatedAccts = await fetch("/api/accounts").then((r) => r.json());
      setAccounts(updatedAccts);
      setTxnForms((prev) => ({ ...prev, [accountId]: { type: "deposit", amountCents: "", description: "", matterId: "", reference: "" } }));
    }
    setSavingTxn(null);
  }

  return (
    <div>
      <PageHead
        eyebrow="Financial accounts"
        title="Accounts"
        action={
          <button onClick={() => setShowNewAcct((v) => !v)} className="btn-primary">
            {showNewAcct ? "Cancel" : "New account"}
          </button>
        }
      />

      {showNewAcct && (
        <div className="card mb-6 p-6">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">New account</h2>
          <form onSubmit={handleNewAccount} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-48">
              <label className="field-label">Account name</label>
              <input
                className="field"
                placeholder="e.g. IOLTA Trust Account"
                value={acctForm.name}
                onChange={(e) => setAcctForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="field-label">Type</label>
              <select
                className="field"
                value={acctForm.type}
                onChange={(e) => setAcctForm((f) => ({ ...f, type: e.target.value as "operating" | "trust" }))}
              >
                <option value="operating">Operating</option>
                <option value="trust">Trust (IOLTA)</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={savingAcct}>
              {savingAcct ? "Creating…" : "Create account"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : accounts.length === 0 ? (
        <Empty title="No accounts" hint="Create your first account using the button above." />
      ) : (
        <div className="space-y-8">
          {accounts.map((acct) => {
            const txns = txnsByAccount[acct.id] ?? [];
            const f = txnForm(acct.id);
            return (
              <div key={acct.id} className="card overflow-hidden">
                {/* Account header */}
                <div className="flex items-center justify-between border-b border-line px-6 py-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-display text-base font-semibold text-ink">{acct.name}</h2>
                      <span className={`pill ${TYPE_TONE[acct.type] ?? "bg-muted/10 text-muted"}`}>
                        {acct.type.charAt(0).toUpperCase() + acct.type.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="eyebrow">Balance</p>
                    <p className="font-display text-2xl font-semibold text-ink">{fmtMoney(acct.balanceCents)}</p>
                  </div>
                </div>

                {/* Transactions */}
                {txns.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-line bg-canvas/50 text-left">
                        <th className="px-6 py-3 font-medium text-muted">Date</th>
                        <th className="px-6 py-3 font-medium text-muted">Description</th>
                        <th className="px-6 py-3 font-medium text-muted">Matter</th>
                        <th className="px-6 py-3 font-medium text-muted">Type</th>
                        <th className="px-6 py-3 text-right font-medium text-muted">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {txns.map((txn) => (
                        <tr key={txn.id}>
                          <td className="px-6 py-3 text-muted">{formatDate(txn.date)}</td>
                          <td className="px-6 py-3 text-ink">{txn.description}</td>
                          <td className="px-6 py-3 text-muted">{txn.matterName || "—"}</td>
                          <td className="px-6 py-3">
                            <span className={`pill ${txn.type === "deposit" ? "bg-positive/10 text-positive" : "bg-danger/10 text-danger"}`}>
                              {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                            </span>
                          </td>
                          <td className={`px-6 py-3 text-right font-mono font-medium ${txn.type === "deposit" ? "text-positive" : "text-danger"}`}>
                            {txn.type === "deposit" ? "+" : "−"}{fmtMoney(txn.amountCents)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="px-6 py-4 text-sm text-muted">No transactions yet.</p>
                )}

                {/* Add transaction form */}
                <div className="border-t border-line bg-canvas/40 px-6 py-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Add transaction</p>
                  <form onSubmit={(e) => handleAddTxn(e, acct.id)} className="flex flex-wrap items-end gap-3">
                    <div>
                      <label className="field-label">Type</label>
                      <select
                        className="field w-32"
                        value={f.type}
                        onChange={(e) => setTxnForm(acct.id, { type: e.target.value })}
                      >
                        <option value="deposit">Deposit</option>
                        <option value="withdrawal">Withdrawal</option>
                      </select>
                    </div>
                    <div className="flex-1 min-w-40">
                      <label className="field-label">Description</label>
                      <input
                        className="field"
                        placeholder="Description…"
                        value={f.description}
                        onChange={(e) => setTxnForm(acct.id, { description: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="field-label">Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        className="field w-32"
                        placeholder="0.00"
                        value={f.amountCents}
                        onChange={(e) => setTxnForm(acct.id, { amountCents: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="field-label">Matter (optional)</label>
                      <select
                        className="field w-48"
                        value={f.matterId}
                        onChange={(e) => setTxnForm(acct.id, { matterId: e.target.value })}
                      >
                        <option value="">— None —</option>
                        {matters.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="field-label">Reference</label>
                      <input
                        className="field w-36"
                        placeholder="Check #, ACH…"
                        value={f.reference}
                        onChange={(e) => setTxnForm(acct.id, { reference: e.target.value })}
                      />
                    </div>
                    <button type="submit" className="btn-primary" disabled={savingTxn === acct.id}>
                      {savingTxn === acct.id ? "Saving…" : "Add"}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

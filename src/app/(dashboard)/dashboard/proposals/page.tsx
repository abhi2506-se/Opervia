"use client";

import { useEffect, useState } from "react";

type Proposal = {
  id: string;
  title: string;
  amount: string | number | null;
  currency: string;
  status: string;
  createdAt: string;
  agent: { user: { name: string } };
  lead: { name: string } | null;
  client: { name: string } | null;
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#4a5568",
  READY: "#0e3a5f",
  SENT: "#7c3aed",
  VIEWED: "#b7862b",
  ACCEPTED: "#1e6b3c",
  REJECTED: "#b3261e",
  CHANGE_REQUESTED: "#c2410c",
  EXPIRED: "#4a5568",
  CANCELLED: "#4a5568",
};

const NEXT_STATUS: Record<string, string[]> = {
  DRAFT: ["READY", "CANCELLED"],
  READY: ["SENT", "CANCELLED"],
  SENT: ["VIEWED", "ACCEPTED", "REJECTED", "CHANGE_REQUESTED"],
  VIEWED: ["ACCEPTED", "REJECTED", "CHANGE_REQUESTED"],
  CHANGE_REQUESTED: ["READY", "CANCELLED"],
};

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", currency: "INR" });
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/proposals");
    if (res.ok) {
      const data = await res.json();
      setProposals(data.proposals ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        amount: form.amount ? Number(form.amount) : undefined,
        currency: form.currency,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to create proposal");
      return;
    }
    setForm({ title: "", amount: "", currency: "INR" });
    setShowForm(false);
    load();
  }

  async function setStatus(proposal: Proposal, status: string) {
    setBusyId(proposal.id);
    await fetch(`/api/proposals/${proposal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusyId(null);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--navy-deep)" }}>
            Proposals
          </h1>
          <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
            {proposals.length} total
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "New proposal"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="panel p-4 mb-4 grid grid-cols-3 gap-3 items-end">
          <div>
            <div className="field-label">Title</div>
            <input
              required
              className="field-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <div className="field-label">Amount</div>
            <input
              type="number"
              className="field-input"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div>
            <div className="field-label">Currency</div>
            <input
              className="field-input"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            />
          </div>
          <div className="col-span-3">
            <button className="btn-primary" type="submit">
              Create draft
            </button>
            {error && (
              <span className="text-sm ml-3" style={{ color: "#b3261e" }}>
                {error}
              </span>
            )}
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-sm" style={{ color: "var(--ink-muted)" }}>
          Loading…
        </div>
      ) : proposals.length === 0 ? (
        <div className="text-sm" style={{ color: "var(--ink-muted)" }}>
          No proposals yet. Proposal emails will link here once the Email module is wired in.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b" style={{ color: "var(--ink-muted)" }}>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Lead / Client</th>
                <th className="py-2 pr-4">Agent</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-2 pr-4">{p.title}</td>
                  <td className="py-2 pr-4">{p.lead?.name ?? p.client?.name ?? "—"}</td>
                  <td className="py-2 pr-4">{p.agent.user.name}</td>
                  <td className="py-2 pr-4">
                    {p.amount ? `${p.currency} ${Number(p.amount).toLocaleString()}` : "—"}
                  </td>
                  <td className="py-2 pr-4">
                    <span style={{ color: STATUS_COLORS[p.status] }}>{p.status}</span>
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex gap-1 flex-wrap">
                      {(NEXT_STATUS[p.status] ?? []).map((next) => (
                        <button
                          key={next}
                          disabled={busyId === p.id}
                          className="btn-secondary text-xs px-2 py-1"
                          onClick={() => setStatus(p, next)}
                        >
                          {next.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

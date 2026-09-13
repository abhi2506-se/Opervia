"use client";

import { useEffect, useState } from "react";

type Commission = {
  id: string;
  sourceType: string;
  sourceId: string;
  amount: string | number;
  currency: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID" | "REVERSED";
  createdAt: string;
  reversalReason: string | null;
  agent: { user: { name: string; email: string } };
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#b7862b",
  APPROVED: "#0e3a5f",
  REJECTED: "#b3261e",
  PAID: "#1e6b3c",
  REVERSED: "#4a5568",
};

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/commissions");
    if (res.ok) {
      const data = await res.json();
      setCommissions(data.commissions ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    fetch("/api/agents")
      .then((r) => setIsAdmin(r.ok))
      .catch(() => setIsAdmin(false));
  }, []);

  async function act(commission: Commission, action: "APPROVE" | "REJECT" | "PAY" | "REVERSE") {
    let reason: string | undefined;
    if (action === "REJECT" || action === "REVERSE") {
      reason = window.prompt(`Reason to ${action.toLowerCase()} this commission:`) ?? undefined;
      if (!reason) return;
    }
    setBusyId(commission.id);
    await fetch(`/api/commissions/${commission.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    setBusyId(null);
    load();
  }

  const totals = commissions.reduce(
    (acc, c) => {
      const amt = Number(c.amount);
      if (c.status === "PENDING") acc.pending += amt;
      if (c.status === "APPROVED") acc.approved += amt;
      if (c.status === "PAID") acc.paid += amt;
      return acc;
    },
    { pending: 0, approved: 0, paid: 0 }
  );

  return (
    <div>
      <h1 className="text-lg font-semibold mb-1" style={{ color: "var(--navy-deep)" }}>
        Commissions
      </h1>
      <p className="text-xs mb-4" style={{ color: "var(--ink-muted)" }}>
        {commissions.length} records — figures are live, computed from this ledger only.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="panel p-4">
          <div className="field-label">Pending</div>
          <div className="text-xl font-semibold mt-1">₹{totals.pending.toLocaleString()}</div>
        </div>
        <div className="panel p-4">
          <div className="field-label">Approved</div>
          <div className="text-xl font-semibold mt-1">₹{totals.approved.toLocaleString()}</div>
        </div>
        <div className="panel p-4">
          <div className="field-label">Paid</div>
          <div className="text-xl font-semibold mt-1">₹{totals.paid.toLocaleString()}</div>
        </div>
      </div>

      {loading ? (
        <div className="text-sm" style={{ color: "var(--ink-muted)" }}>
          Loading…
        </div>
      ) : commissions.length === 0 ? (
        <div className="text-sm" style={{ color: "var(--ink-muted)" }}>
          No commission records yet. Commissions will populate automatically once the Email/Proposal
          triggers (Phase 2) are wired in, or an Admin can record one manually.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b" style={{ color: "var(--ink-muted)" }}>
                <th className="py-2 pr-4">Agent</th>
                <th className="py-2 pr-4">Source</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Date</th>
                {isAdmin && <th className="py-2 pr-4">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {commissions.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="py-2 pr-4">{c.agent.user.name}</td>
                  <td className="py-2 pr-4">
                    {c.sourceType} <span style={{ color: "var(--ink-muted)" }}>#{c.sourceId.slice(0, 8)}</span>
                  </td>
                  <td className="py-2 pr-4">
                    {c.currency} {Number(c.amount).toLocaleString()}
                  </td>
                  <td className="py-2 pr-4">
                    <span style={{ color: STATUS_COLORS[c.status] }}>{c.status}</span>
                    {c.reversalReason && (
                      <div className="text-xs" style={{ color: "var(--ink-muted)" }}>
                        {c.reversalReason}
                      </div>
                    )}
                  </td>
                  <td className="py-2 pr-4">{new Date(c.createdAt).toLocaleDateString()}</td>
                  {isAdmin && (
                    <td className="py-2 pr-4">
                      <div className="flex gap-1 flex-wrap">
                        {c.status === "PENDING" && (
                          <>
                            <button
                              disabled={busyId === c.id}
                              className="btn-secondary text-xs px-2 py-1"
                              onClick={() => act(c, "APPROVE")}
                            >
                              Approve
                            </button>
                            <button
                              disabled={busyId === c.id}
                              className="btn-secondary text-xs px-2 py-1"
                              onClick={() => act(c, "REJECT")}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {c.status === "APPROVED" && (
                          <button
                            disabled={busyId === c.id}
                            className="btn-secondary text-xs px-2 py-1"
                            onClick={() => act(c, "PAY")}
                          >
                            Mark paid
                          </button>
                        )}
                        {["APPROVED", "PAID"].includes(c.status) && (
                          <button
                            disabled={busyId === c.id}
                            className="btn-secondary text-xs px-2 py-1"
                            onClick={() => act(c, "REVERSE")}
                          >
                            Reverse
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

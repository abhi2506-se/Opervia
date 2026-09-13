"use client";

import { useEffect, useState } from "react";

type EmailRow = {
  id: string;
  emailType: string;
  fromEmail: string;
  fromName: string;
  toEmails: string[];
  subject: string;
  status: string;
  createdAt: string;
  sentAt: string | null;
  deliveredAt: string | null;
  failureReason: string | null;
  agent: { user: { name: string } };
  attachments: { id: string; fileName: string }[];
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#4a5568",
  QUEUED: "#b7862b",
  SENDING: "#b7862b",
  SENT: "#0e3a5f",
  DELIVERED: "#1e6b3c",
  BOUNCED: "#b3261e",
  FAILED: "#b3261e",
  REPLIED: "#1e6b3c",
  CANCELLED: "#4a5568",
};

export default function EmailActivityPage() {
  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selected, setSelected] = useState<EmailRow | null>(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (typeFilter) params.set("emailType", typeFilter);
    const res = await fetch(`/api/emails?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setEmails(data.emails ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--navy-deep)" }}>
            Email Activity
          </h1>
          <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
            {emails.length} shown
          </p>
        </div>
        <a href="/dashboard/emails/compose" className="btn-primary">
          Compose Email
        </a>
      </div>

      <div className="flex gap-2 mb-4">
        <select className="field-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {Object.keys(STATUS_COLORS).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select className="field-input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          <option value="PROPOSAL">Proposal</option>
          <option value="SALES">Sales</option>
          <option value="GENERAL">General</option>
        </select>
      </div>

      {loading ? (
        <div className="text-sm" style={{ color: "var(--ink-muted)" }}>
          Loading…
        </div>
      ) : emails.length === 0 ? (
        <div className="text-sm" style={{ color: "var(--ink-muted)" }}>
          No emails yet. Nothing shows here as "Sent" unless the provider actually accepted it.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b" style={{ color: "var(--ink-muted)" }}>
                <th className="py-2 pr-4">Subject</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">To</th>
                <th className="py-2 pr-4">Agent</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((e) => (
                <tr
                  key={e.id}
                  className="border-b cursor-pointer hover:bg-black/5"
                  onClick={() => setSelected(e)}
                >
                  <td className="py-2 pr-4">{e.subject}</td>
                  <td className="py-2 pr-4">{e.emailType}</td>
                  <td className="py-2 pr-4">{e.toEmails.join(", ")}</td>
                  <td className="py-2 pr-4">{e.agent.user.name}</td>
                  <td className="py-2 pr-4">
                    <span style={{ color: STATUS_COLORS[e.status] }}>{e.status}</span>
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {new Date(e.sentAt ?? e.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
          onClick={() => setSelected(null)}
        >
          <div className="bg-white rounded-lg p-6 max-w-xl w-full text-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold mb-2" style={{ color: "var(--navy-deep)" }}>
              {selected.subject}
            </h2>
            <div style={{ color: "var(--ink-muted)" }} className="mb-1">
              From {selected.fromName} &lt;{selected.fromEmail}&gt;
            </div>
            <div style={{ color: "var(--ink-muted)" }} className="mb-3">
              To {selected.toEmails.join(", ")}
            </div>
            <div className="mb-2">
              Status: <span style={{ color: STATUS_COLORS[selected.status] }}>{selected.status}</span>
            </div>
            {selected.failureReason && (
              <div className="mb-2" style={{ color: "#b3261e" }}>
                Failure reason: {selected.failureReason}
              </div>
            )}
            {selected.attachments.length > 0 && (
              <div className="mb-2">
                Attachments:
                <ul>
                  {selected.attachments.map((a) => (
                    <li key={a.id}>
                      <a
                        className="underline"
                        href={`/api/emails/attachments/${a.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {a.fileName}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button className="btn-secondary mt-3" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

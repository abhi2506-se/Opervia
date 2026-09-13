"use client";

import { useEffect, useState } from "react";

type AuditLogRow = {
  id: string;
  actorName: string | null;
  actorEmail: string | null;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string | null;
  status: "SUCCESS" | "FAILED";
  ipAddress: string | null;
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: "#1e6b3c",
  FAILED: "#b3261e",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AuditLogRow | null>(null);

  const [q, setQ] = useState("");
  const [action, setAction] = useState("");
  const [role, setRole] = useState("");
  const [entityType, setEntityType] = useState("");
  const [status, setStatus] = useState("");

  function buildQuery(extra?: Record<string, string>) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (action) params.set("action", action);
    if (role) params.set("role", role);
    if (entityType) params.set("entityType", entityType);
    if (status) params.set("status", status);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (extra) Object.entries(extra).forEach(([k, v]) => params.set(k, v));
    return params.toString();
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/audit-logs?${buildQuery()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load audit logs");
      }
      const data = await res.json();
      setLogs(data.logs ?? []);
      setTotal(data.total ?? 0);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (page !== 1) setPage(1);
    else load();
  }

  function handleExport() {
    const query = buildQuery({ format: "csv" });
    window.open(`/api/audit-logs?${query}`, "_blank");
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--navy-deep)" }}>
            Audit Logs
          </h1>
          <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
            {total} events — every agent and admin action, immutable
          </p>
        </div>
        <button className="btn-secondary" onClick={handleExport}>
          Export CSV
        </button>
      </div>

      <form onSubmit={handleFilterSubmit} className="flex flex-wrap gap-2 mb-4">
        <input
          className="field-input"
          placeholder="Search agent name or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input
          className="field-input"
          placeholder="Action (e.g. lead.created)"
          value={action}
          onChange={(e) => setAction(e.target.value)}
        />
        <select className="field-input" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="AGENT">Agent</option>
          <option value="CLIENT">Client</option>
        </select>
        <input
          className="field-input"
          placeholder="Entity type (e.g. Lead, EmailMessage)"
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
        />
        <select className="field-input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
        </select>
        <button type="submit" className="btn-primary">
          Filter
        </button>
      </form>

      {error && (
        <div className="text-sm mb-3" style={{ color: "#b3261e" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm" style={{ color: "var(--ink-muted)" }}>
          Loading…
        </div>
      ) : logs.length === 0 ? (
        <div className="text-sm" style={{ color: "var(--ink-muted)" }}>
          No audit events match these filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b" style={{ color: "var(--ink-muted)" }}>
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Actor</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Action</th>
                <th className="py-2 pr-4">Entity</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b cursor-pointer hover:bg-black/5"
                  onClick={() => setSelected(log)}
                >
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 pr-4">
                    <div>{log.actorName ?? "Unknown"}</div>
                    <div className="text-xs" style={{ color: "var(--ink-muted)" }}>
                      {log.actorEmail}
                    </div>
                  </td>
                  <td className="py-2 pr-4">{log.actorRole}</td>
                  <td className="py-2 pr-4">
                    <div>{log.action}</div>
                    {log.description && (
                      <div className="text-xs" style={{ color: "var(--ink-muted)" }}>
                        {log.description}
                      </div>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {log.entityType}
                    {log.entityId ? `#${log.entityId.slice(0, 8)}` : ""}
                  </td>
                  <td className="py-2 pr-4">
                    <span style={{ color: STATUS_COLORS[log.status] }}>{log.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between mt-4 text-sm">
            <span style={{ color: "var(--ink-muted)" }}>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                className="btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                className="btn-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-lg w-full text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-semibold mb-3" style={{ color: "var(--navy-deep)" }}>
              Event details
            </h2>
            <dl className="space-y-2">
              <Row label="Actor" value={`${selected.actorName ?? "Unknown"} (${selected.actorEmail ?? "—"})`} />
              <Row label="Role" value={selected.actorRole} />
              <Row label="Action" value={selected.action} />
              <Row label="Description" value={selected.description ?? "—"} />
              <Row label="Entity" value={`${selected.entityType} ${selected.entityId ?? ""}`} />
              <Row label="Status" value={selected.status} />
              <Row label="IP address" value={selected.ipAddress ?? "—"} />
              <Row label="Time" value={new Date(selected.createdAt).toLocaleString()} />
            </dl>
            <button className="btn-secondary mt-4" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt style={{ color: "var(--ink-muted)" }}>{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

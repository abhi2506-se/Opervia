"use client";

import { useEffect, useState } from "react";

type AgentRow = {
  id: string;
  designation: string | null;
  user: { id: string; name: string; email: string; phone: string | null; status: string };
  _count: { leads: number; clients: number; projects: number };
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", designation: "" });
  const [error, setError] = useState<string | null>(null);
  const [newCredentials, setNewCredentials] = useState<{ email: string; password: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/agents");
    if (res.ok) {
      const data = await res.json();
      setAgents(data.agents ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to create agent");
      return;
    }
    setNewCredentials({ email: form.email, password: data.tempPassword });
    setForm({ name: "", email: "", phone: "", designation: "" });
    setShowForm(false);
    load();
  }

  async function toggleStatus(agent: AgentRow) {
    setBusyId(agent.id);
    const nextStatus = agent.user.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    await fetch(`/api/agents/${agent.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setBusyId(null);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--navy-deep)" }}>Agents</h1>
          <p className="text-xs" style={{ color: "var(--ink-muted)" }}>{agents.length} total</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ New agent"}
        </button>
      </div>

      {newCredentials && (
        <div className="panel p-4 mb-4" style={{ borderColor: "var(--gold)" }}>
          <p className="text-sm font-medium mb-1">Agent created — share these credentials securely (shown once):</p>
          <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
            Email: <strong>{newCredentials.email}</strong> · Temporary password: <strong>{newCredentials.password}</strong>
          </p>
          <button className="btn-secondary text-xs px-2 py-1 mt-2" onClick={() => setNewCredentials(null)}>Dismiss</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="panel p-4 mb-4 grid grid-cols-2 gap-3">
          {error && <p className="col-span-2 text-xs" style={{ color: "var(--danger)" }}>{error}</p>}
          <div>
            <label className="field-label">Name *</label>
            <input required className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Email *</label>
            <input required type="email" className="field-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Phone</label>
            <input className="field-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Designation</label>
            <input className="field-input" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          </div>
          <div className="col-span-2">
            <button type="submit" className="btn-primary">Create agent</button>
          </div>
        </form>
      )}

      <div className="panel overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Designation</th><th>Leads</th><th>Clients</th><th>Projects</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="text-center py-6" style={{ color: "var(--ink-muted)" }}>Loading…</td></tr>}
            {!loading && agents.length === 0 && (
              <tr><td colSpan={8} className="text-center py-6" style={{ color: "var(--ink-muted)" }}>No agents yet.</td></tr>
            )}
            {agents.map((a) => (
              <tr key={a.id}>
                <td className="font-medium">{a.user.name}</td>
                <td>{a.user.email}</td>
                <td>{a.designation || "—"}</td>
                <td>{a._count.leads}</td>
                <td>{a._count.clients}</td>
                <td>{a._count.projects}</td>
                <td>
                  <span className="badge" style={{ color: a.user.status === "ACTIVE" ? "var(--success)" : "var(--danger)" }}>
                    {a.user.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-secondary text-xs px-2 py-1"
                    disabled={busyId === a.id}
                    onClick={() => toggleStatus(a)}
                  >
                    {busyId === a.id ? "…" : a.user.status === "ACTIVE" ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

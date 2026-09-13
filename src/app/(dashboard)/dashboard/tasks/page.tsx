"use client";

import { useEffect, useState } from "react";

type Task = {
  id: string;
  title: string;
  notes: string | null;
  dueAt: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  agent: { user: { name: string } };
  lead: { name: string } | null;
  client: { name: string } | null;
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#4a5568",
  MEDIUM: "#b7862b",
  HIGH: "#b3261e",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", notes: "", dueAt: "", priority: "MEDIUM" });
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"PENDING" | "COMPLETED" | "ALL">("PENDING");

  async function load() {
    setLoading(true);
    const qs = filter === "ALL" ? "" : `?status=${filter}`;
    const res = await fetch(`/api/tasks${qs}`);
    if (res.ok) {
      const data = await res.json();
      setTasks(data.tasks ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        notes: form.notes || undefined,
        dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : undefined,
        priority: form.priority,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to create follow-up");
      return;
    }
    setForm({ title: "", notes: "", dueAt: "", priority: "MEDIUM" });
    setShowForm(false);
    load();
  }

  async function complete(task: Task) {
    setBusyId(task.id);
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    setBusyId(null);
    load();
  }

  const now = Date.now();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--navy-deep)" }}>
            Follow-ups &amp; Tasks
          </h1>
          <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
            {tasks.length} shown
          </p>
        </div>
        <div className="flex gap-2">
          <select className="field-input" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="ALL">All</option>
          </select>
          <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "New follow-up"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="panel p-4 mb-4 grid grid-cols-4 gap-3 items-end">
          <div className="col-span-2">
            <div className="field-label">Title</div>
            <input
              required
              className="field-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <div className="field-label">Due</div>
            <input
              type="datetime-local"
              className="field-input"
              value={form.dueAt}
              onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
            />
          </div>
          <div>
            <div className="field-label">Priority</div>
            <select
              className="field-input"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div className="col-span-4">
            <div className="field-label">Notes</div>
            <input
              className="field-input"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="col-span-4">
            <button className="btn-primary" type="submit">
              Create
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
      ) : tasks.length === 0 ? (
        <div className="text-sm" style={{ color: "var(--ink-muted)" }}>
          Nothing here.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b" style={{ color: "var(--ink-muted)" }}>
                <th className="py-2 pr-4">Task</th>
                <th className="py-2 pr-4">Related</th>
                <th className="py-2 pr-4">Agent</th>
                <th className="py-2 pr-4">Due</th>
                <th className="py-2 pr-4">Priority</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => {
                const overdue = t.dueAt && new Date(t.dueAt).getTime() < now && t.status === "PENDING";
                return (
                  <tr key={t.id} className="border-b">
                    <td className="py-2 pr-4">
                      <div>{t.title}</div>
                      {t.notes && (
                        <div className="text-xs" style={{ color: "var(--ink-muted)" }}>
                          {t.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-2 pr-4">{t.lead?.name ?? t.client?.name ?? "—"}</td>
                    <td className="py-2 pr-4">{t.agent.user.name}</td>
                    <td className="py-2 pr-4" style={overdue ? { color: "#b3261e" } : undefined}>
                      {t.dueAt ? new Date(t.dueAt).toLocaleString() : "—"}
                      {overdue ? " (overdue)" : ""}
                    </td>
                    <td className="py-2 pr-4">
                      <span style={{ color: PRIORITY_COLORS[t.priority] }}>{t.priority}</span>
                    </td>
                    <td className="py-2 pr-4">
                      {t.status === "PENDING" && (
                        <button
                          disabled={busyId === t.id}
                          className="btn-secondary text-xs px-2 py-1"
                          onClick={() => complete(t)}
                        >
                          Mark complete
                        </button>
                      )}
                      {t.status !== "PENDING" && (
                        <span style={{ color: "var(--ink-muted)" }}>{t.status}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

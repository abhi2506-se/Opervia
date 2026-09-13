"use client";

import { useEffect, useState } from "react";

type Rule = {
  id: string;
  name: string;
  sourceType: string;
  percentage: string | number | null;
  flatAmount: string | number | null;
  active: boolean;
};

export default function CommissionRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", sourceType: "PROPOSAL_ACCEPTED", percentage: "", flatAmount: "" });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/commission-rules");
    if (res.ok) setRules((await res.json()).rules);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/commission-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        sourceType: form.sourceType,
        percentage: form.percentage ? Number(form.percentage) : undefined,
        flatAmount: form.flatAmount ? Number(form.flatAmount) : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to create rule");
      return;
    }
    setForm({ name: "", sourceType: "PROPOSAL_ACCEPTED", percentage: "", flatAmount: "" });
    load();
  }

  async function toggle(rule: Rule) {
    await fetch(`/api/commission-rules/${rule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !rule.active }),
    });
    load();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold mb-1" style={{ color: "var(--navy-deep)" }}>
        Commission Rules
      </h1>
      <p className="text-xs mb-4" style={{ color: "var(--ink-muted)" }}>
        Commissions are only auto-generated when an active rule exists for the trigger's sourceType
        (e.g. "PROPOSAL_ACCEPTED"). No rule = no commission — nothing is invented.
      </p>

      <form onSubmit={create} className="panel p-4 mb-4 grid grid-cols-2 gap-3 items-end">
        <div>
          <div className="field-label">Rule name</div>
          <input required className="field-input w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <div className="field-label">Source type</div>
          <input required className="field-input w-full" value={form.sourceType} onChange={(e) => setForm({ ...form, sourceType: e.target.value })} />
        </div>
        <div>
          <div className="field-label">Percentage (%)</div>
          <input type="number" className="field-input w-full" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: e.target.value })} />
        </div>
        <div>
          <div className="field-label">Flat amount (₹)</div>
          <input type="number" className="field-input w-full" value={form.flatAmount} onChange={(e) => setForm({ ...form, flatAmount: e.target.value })} />
        </div>
        <div className="col-span-2">
          <button className="btn-primary" type="submit">Create rule</button>
          {error && <span className="text-sm ml-3" style={{ color: "#b3261e" }}>{error}</span>}
        </div>
      </form>

      {loading ? (
        <div className="text-sm" style={{ color: "var(--ink-muted)" }}>Loading…</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b" style={{ color: "var(--ink-muted)" }}>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Source</th>
              <th className="py-2 pr-4">Rate</th>
              <th className="py-2 pr-4">Active</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="py-2 pr-4">{r.name}</td>
                <td className="py-2 pr-4">{r.sourceType}</td>
                <td className="py-2 pr-4">{r.percentage ? `${r.percentage}%` : `₹${r.flatAmount}`}</td>
                <td className="py-2 pr-4">
                  <button className="btn-secondary text-xs px-2 py-1" onClick={() => toggle(r)}>
                    {r.active ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

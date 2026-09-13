"use client";

import { useEffect, useState } from "react";

type Settings = { enabled: boolean; defaultTone: string; defaultLanguage: string };
type ProviderStatus = { aiConfigured: boolean; aiModel: string | null; aiBaseUrl: string | null };

export default function AISettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/settings/ai");
    if (res.ok) {
      const data = await res.json();
      setSettings(data.settings);
      setStatus(data.providerStatus);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(patch: Partial<Settings>) {
    if (!settings) return;
    setSaving(true);
    const res = await fetch("/api/settings/ai", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) setSettings((await res.json()).settings);
    setSaving(false);
  }

  if (!settings || !status) {
    return <div className="text-sm" style={{ color: "var(--ink-muted)" }}>Loading…</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold mb-1" style={{ color: "var(--navy-deep)" }}>
        AI Settings
      </h1>
      <p className="text-xs mb-4" style={{ color: "var(--ink-muted)" }}>
        The AI API key, base URL and model are set via environment variables (AI_API_KEY, AI_BASE_URL,
        AI_MODEL) and never shown here.
      </p>

      <div className="panel p-4 mb-4">
        <div className="flex items-center justify-between text-sm py-1">
          <span>AI provider key</span>
          <span style={{ color: status.aiConfigured ? "#1e6b3c" : "#b3261e" }}>
            {status.aiConfigured ? "Configured" : "Not configured"}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm py-1">
          <span>Model</span>
          <span>{status.aiModel ?? "—"}</span>
        </div>
        <div className="flex items-center justify-between text-sm py-1">
          <span>Base URL</span>
          <span>{status.aiBaseUrl ?? "—"}</span>
        </div>
      </div>

      <div className="panel p-4 space-y-3">
        <label className="flex items-center justify-between text-sm">
          AI generation enabled platform-wide
          <input type="checkbox" checked={settings.enabled} onChange={(e) => save({ enabled: e.target.checked })} />
        </label>
        <div>
          <div className="field-label">Default tone</div>
          <select
            className="field-input"
            value={settings.defaultTone}
            onChange={(e) => save({ defaultTone: e.target.value })}
          >
            {["PROFESSIONAL", "FRIENDLY", "PERSUASIVE", "PREMIUM", "CONCISE"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="field-label">Default language</div>
          <select
            className="field-input"
            value={settings.defaultLanguage}
            onChange={(e) => save({ defaultLanguage: e.target.value })}
          >
            {["ENGLISH", "HINDI", "HINGLISH"].map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>
      {saving && <div className="text-xs mt-2" style={{ color: "var(--ink-muted)" }}>Saving…</div>}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type Settings = {
  aiGenerationEnabled: boolean;
  inboundEmailEnabled: boolean;
  dailySendingLimitPerAgent: number;
  maxAttachmentSizeMb: number;
};

type ProviderStatus = {
  resendConfigured: boolean;
  proposalSenderConfigured: boolean;
  salesSenderConfigured: boolean;
  webhookSecretConfigured: boolean;
  storageProvider: string;
};

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span>{label}</span>
      <span style={{ color: ok ? "#1e6b3c" : "#b3261e" }}>{ok ? "Configured" : "Not configured"}</span>
    </div>
  );
}

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function load() {
    const res = await fetch("/api/settings/email");
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
    setSaved(false);
    const res = await fetch("/api/settings/email", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const data = await res.json();
      setSettings(data.settings);
      setSaved(true);
    }
    setSaving(false);
  }

  if (!settings || !status) {
    return <div className="text-sm" style={{ color: "var(--ink-muted)" }}>Loading…</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold mb-1" style={{ color: "var(--navy-deep)" }}>
        Email Settings
      </h1>
      <p className="text-xs mb-4" style={{ color: "var(--ink-muted)" }}>
        Secrets (API keys, webhook secret) are set via environment variables and never shown here —
        this page only shows whether they're present, and controls behavior toggles.
      </p>

      <div className="panel p-4 mb-4">
        <div className="field-label mb-2">Provider status</div>
        <StatusPill ok={status.resendConfigured} label="Resend API key" />
        <StatusPill ok={status.proposalSenderConfigured} label="Proposal sender (EMAIL_FROM_PROPOSAL)" />
        <StatusPill ok={status.salesSenderConfigured} label="Sales sender (EMAIL_FROM_SALES)" />
        <StatusPill ok={status.webhookSecretConfigured} label="Webhook signing secret" />
        <div className="flex items-center justify-between py-1 text-sm">
          <span>Attachment storage</span>
          <span>{status.storageProvider}</span>
        </div>
      </div>

      <div className="panel p-4 mb-4 space-y-3">
        <label className="flex items-center justify-between text-sm">
          AI email generation enabled
          <input
            type="checkbox"
            checked={settings.aiGenerationEnabled}
            onChange={(e) => save({ aiGenerationEnabled: e.target.checked })}
          />
        </label>
        <label className="flex items-center justify-between text-sm">
          Inbound email (reply capture) enabled
          <input
            type="checkbox"
            checked={settings.inboundEmailEnabled}
            onChange={(e) => save({ inboundEmailEnabled: e.target.checked })}
          />
        </label>
        <div>
          <div className="field-label">Daily sending limit per agent</div>
          <input
            type="number"
            className="field-input w-32"
            value={settings.dailySendingLimitPerAgent}
            onChange={(e) => setSettings({ ...settings, dailySendingLimitPerAgent: Number(e.target.value) })}
            onBlur={(e) => save({ dailySendingLimitPerAgent: Number(e.target.value) })}
          />
        </div>
        <div>
          <div className="field-label">Max attachment size (MB)</div>
          <input
            type="number"
            className="field-input w-32"
            value={settings.maxAttachmentSizeMb}
            onChange={(e) => setSettings({ ...settings, maxAttachmentSizeMb: Number(e.target.value) })}
            onBlur={(e) => save({ maxAttachmentSizeMb: Number(e.target.value) })}
          />
        </div>
      </div>

      {saving && <div className="text-xs" style={{ color: "var(--ink-muted)" }}>Saving…</div>}
      {saved && !saving && <div className="text-xs" style={{ color: "#1e6b3c" }}>Saved.</div>}
    </div>
  );
}

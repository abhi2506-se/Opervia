"use client";

import { useEffect, useRef, useState } from "react";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch("/api/notifications");
    if (!res.ok) return;
    const data = await res.json();
    setNotifications(data.notifications ?? []);
    setUnreadCount(data.unreadCount ?? 0);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // simple polling fallback
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function markOneRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    load();
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    load();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative px-2 py-1.5 text-sm"
        aria-label="Notifications"
        style={{ color: "var(--navy-deep)" }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 rounded-full text-[10px] px-1 leading-tight text-white"
            style={{ background: "var(--danger)" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1 w-80 max-h-96 overflow-y-auto z-50 panel"
          style={{ border: "1px solid var(--line)" }}
        >
          <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: "1px solid var(--line)" }}>
            <span className="text-xs font-medium">Notifications</span>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs underline" style={{ color: "var(--navy)" }}>
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 && (
            <p className="text-xs px-3 py-4 text-center" style={{ color: "var(--ink-muted)" }}>
              No notifications yet.
            </p>
          )}
          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => !n.read && markOneRead(n.id)}
              className="block w-full text-left px-3 py-2 text-xs"
              style={{
                borderBottom: "1px solid var(--line)",
                background: n.read ? "transparent" : "#eef4fa",
              }}
            >
              <div className="font-medium" style={{ color: "var(--navy-deep)" }}>{n.title}</div>
              {n.body && <div style={{ color: "var(--ink-muted)" }}>{n.body}</div>}
              <div className="mt-0.5" style={{ color: "var(--ink-muted)" }}>
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

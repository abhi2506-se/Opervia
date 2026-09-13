import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NotificationBell } from "./notification-bell";

const NAV = [
  { href: "/dashboard", label: "Dashboard", roles: ["ADMIN", "AGENT", "CLIENT"] },
  { href: "/dashboard/leads", label: "Leads", roles: ["ADMIN", "AGENT"] },
  { href: "/dashboard/clients", label: "Clients", roles: ["ADMIN", "AGENT"] },
  { href: "/dashboard/projects", label: "Projects", roles: ["ADMIN", "AGENT", "CLIENT"] },
  { href: "/dashboard/proposals", label: "Proposals", roles: ["ADMIN", "AGENT"] },
  { href: "/dashboard/profile", label: "Profile & Settings", roles: ["CLIENT"] },
  { href: "/dashboard/emails", label: "Email Activity", roles: ["ADMIN", "AGENT"] },
  { href: "/dashboard/emails/compose", label: "Compose Email", roles: ["AGENT"] },
  { href: "/dashboard/tasks", label: "Follow-ups", roles: ["ADMIN", "AGENT"] },
  { href: "/dashboard/commissions", label: "Commissions", roles: ["ADMIN", "AGENT"] },
  { href: "/dashboard/commission-rules", label: "Commission Rules", roles: ["ADMIN"] },
  { href: "/dashboard/agents", label: "Agents", roles: ["ADMIN"] },
  { href: "/dashboard/audit-logs", label: "Audit Logs", roles: ["ADMIN"] },
  { href: "/dashboard/settings/email", label: "Email Settings", roles: ["ADMIN"] },
  { href: "/dashboard/settings/ai", label: "AI Settings", roles: ["ADMIN"] },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand px-5 py-4 flex items-center gap-2.5">
          <img src="/logo.png" alt="Opervia" className="w-8 h-8 object-contain flex-shrink-0" />
          <div>
            <div className="text-white font-semibold text-sm">Opervia</div>
            <div className="text-[11px]" style={{ color: "#9fb3c8" }}>
              {role === "ADMIN" ? "Administrator" : role === "AGENT" ? "Agent workspace" : "Client portal"}
            </div>
          </div>
        </div>
        <nav className="app-nav py-2">
          {NAV.filter((item) => item.roles.includes(role)).map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-col min-h-screen">
        <header className="app-topbar px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Opervia" className="w-6 h-6 object-contain" />
            <div className="text-sm font-medium" style={{ color: "var(--ink)" }}>
              {session.user.name}
              <span className="ml-2 badge" style={{ color: "var(--navy)" }}>
                {role}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button type="submit" className="btn-secondary text-xs px-3 py-1.5">
                Sign out
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-6" style={{ background: "var(--slate-bg)" }}>
          {role === "CLIENT" && !session.user.hasVerifiedEmail && (
            <div
              className="mb-4 px-4 py-2 text-xs flex items-center justify-between"
              style={{ background: "#fff6e5", border: "1px solid var(--gold)", color: "var(--navy-deep)" }}
            >
              <span>Please verify your email address to unlock all Client Portal features.</span>
              <a href="/dashboard/profile" className="underline font-medium">Resend verification</a>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

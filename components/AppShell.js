"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  Landmark,
  BarChart3,
  Target,
  FileText,
  StickyNote,
  ScrollText,
  Settings,
  Repeat,
  CalendarClock,
  LogOut,
  Download,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/debts", label: "Debts", icon: Wallet },
  { href: "/cards", label: "Cards", icon: CreditCard },
  { href: "/accounts", label: "Accounts", icon: Landmark },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/recurring", label: "Recurring", icon: Repeat },
  { href: "/subscriptions", label: "Subscriptions", icon: CalendarClock },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/logs", label: "Logs", icon: ScrollText },
  { href: "/export", label: "Export", icon: Download },
  { href: "/settings", label: "Settings", icon: Settings },
];

const mobilePrimaryItems = navItems.slice(0, 4);

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r border-[var(--fidgerPanelBorder)] p-4 gap-1">
        <div className="px-2 py-3 mb-2">
          <span className="text-lg font-semibold">Fidger</span>
        </div>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                isActive
                  ? "bg-[var(--fidgerAccent)]/15 text-[var(--fidgerText)]"
                  : "text-[var(--fidgerTextMuted)] hover:bg-white/5"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--fidgerTextMuted)] hover:bg-white/5"
        >
          <LogOut size={18} />
          Log out
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">{children}</main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-[var(--fidgerPanelBorder)] bg-[var(--fidgerBgElevated)]/95 backdrop-blur-lg flex justify-around py-2 z-20">
          {mobilePrimaryItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg fidgerTouchTarget justify-center ${
                  isActive ? "text-[var(--fidgerAccent)]" : "text-[var(--fidgerTextMuted)]"
                }`}
              >
                <Icon size={20} />
                <span className="text-[11px]">{label}</span>
              </Link>
            );
          })}
          <Link
            href="/settings"
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg fidgerTouchTarget justify-center ${
              pathname === "/settings" ? "text-[var(--fidgerAccent)]" : "text-[var(--fidgerTextMuted)]"
            }`}
          >
            <Settings size={20} />
            <span className="text-[11px]">Settings</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

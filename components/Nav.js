"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/finance", label: "Finance", icon: "\u{1F4B0}" },
  { href: "/notes", label: "Notes", icon: "\u{1F4DD}" },
  { href: "/todos", label: "To-dos", icon: "\u2705" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 transition-colors">
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          My Space
        </span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-red-600"
          >
            Sign out
          </button>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-around py-2 z-10 transition-colors">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center text-xs px-4 py-1 rounded-lg ${
                active
                  ? "text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

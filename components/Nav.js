"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "motion/react";
import { Wallet, StickyNote, CheckSquare, LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/finance", label: "Finance", Icon: Wallet },
  { href: "/notes", label: "Notes", Icon: StickyNote },
  { href: "/todos", label: "To-dos", Icon: CheckSquare },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-surface border-b border-zinc-200 dark:border-surface-border sticky top-0 z-10 transition-colors">
        <span className="font-semibold text-zinc-950 dark:text-ink tracking-tight">
          My Space
        </span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            aria-label="Sign out"
            className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-50 dark:hover:bg-surface-card transition-colors"
          >
            <LogOut size={18} strokeWidth={1.75} />
          </button>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-surface border-t border-zinc-200 dark:border-surface-border flex justify-around py-1.5 z-10 transition-colors">
        {links.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className="relative flex flex-col items-center gap-0.5 text-xs px-5 py-1.5 rounded-lg">
              {active && (
                <motion.span
                  layoutId="nav-active"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                  className="absolute inset-0 bg-accent/10 dark:bg-accent/15 rounded-lg -z-10"
                />
              )}
              <Icon
                size={20}
                strokeWidth={active ? 2.25 : 1.75}
                className={active ? "text-accent dark:text-accent" : "text-zinc-400 dark:text-ink0"}
              />
              <span className={active ? "text-accent dark:text-accent font-medium" : "text-zinc-400 dark:text-ink0"}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

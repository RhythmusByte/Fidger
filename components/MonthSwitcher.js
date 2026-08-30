"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MonthSwitcher({ year, month, onChange }) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  function shift(delta) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    onChange(newYear, newMonth);
  }

  return (
    <div className="flex items-center justify-between mb-4 bg-white dark:bg-surface-card rounded-xl border border-zinc-200 dark:border-surface-border px-2 py-2 transition-colors">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => shift(-1)}
        aria-label="Previous month"
        className="p-1.5 rounded-lg text-zinc-400 hover:text-accent dark:hover:text-accent hover:bg-zinc-50 dark:hover:bg-surface-elevated transition-colors"
      >
        <ChevronLeft size={18} strokeWidth={2} />
      </motion.button>
      <div className="overflow-hidden relative h-5 flex items-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={`${year}-${month}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="font-medium text-sm dark:text-ink block"
          >
            {monthNames[month]} {year}
          </motion.span>
        </AnimatePresence>
      </div>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => shift(1)}
        aria-label="Next month"
        className="p-1.5 rounded-lg text-zinc-400 hover:text-accent dark:hover:text-accent hover:bg-zinc-50 dark:hover:bg-surface-elevated transition-colors"
      >
        <ChevronRight size={18} strokeWidth={2} />
      </motion.button>
    </div>
  );
}

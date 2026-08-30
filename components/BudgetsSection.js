"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Check, X, AlertTriangle } from "lucide-react";

export default function BudgetsSection({ budgets, spendingByCategory, onChange }) {
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!category || !limit) return;

    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, limit }),
    });

    setCategory("");
    setLimit("");
    setShowForm(false);
    onChange();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this budget?")) return;
    await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <div className="bg-white dark:bg-surface-card rounded-xl border border-zinc-200 dark:border-surface-border p-4 mb-4 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-zinc-800 dark:text-ink">
          Budgets
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs text-accent dark:text-accent font-medium"
        >
          {showForm ? "Cancel" : (<><Plus size={14} strokeWidth={2.5} /> Set budget</>)}
        </button>
      </div>

      <AnimatePresence>
      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-2 mb-3 overflow-hidden"
        >
          <input
            type="text"
            placeholder="Category (e.g. Food)"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-400 dark:border-surface-borderStrong dark:bg-surface-elevated dark:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Monthly limit"
            required
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-400 dark:border-surface-borderStrong dark:bg-surface-elevated dark:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 bg-accent text-white py-2 rounded-lg font-medium hover:bg-accent-hover"
          >
            <Check size={16} strokeWidth={2} />
            Save budget
          </motion.button>
        </motion.form>
      )}
      </AnimatePresence>

      {budgets.length === 0 ? (
        <p className="text-sm text-zinc-400">
          No budgets set. Add a category limit to track spending against it.
        </p>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence>
          {budgets.map((b) => {
            const spent = spendingByCategory[b.category] || 0;
            const pct = Math.min((spent / b.limit) * 100, 100);
            const over = spent > b.limit;
            return (
              <motion.li
                key={b._id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
              >
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium dark:text-ink flex items-center gap-1.5">
                    {b.category}
                    {over && <AlertTriangle size={13} strokeWidth={2} className="text-red-500" />}
                  </span>
                  <span
                    className={
                      over
                        ? "text-red-600 dark:text-red-400"
                        : "text-zinc-500 dark:text-ink-muted"
                    }
                  >
                    {spent.toFixed(2)} / {b.limit.toFixed(2)}
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-50 dark:bg-surface-elevated rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`h-full ${over ? "bg-red-500" : "bg-accent"}`}
                  />
                </div>
                <button
                  onClick={() => handleDelete(b._id)}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-500 mt-1"
                >
                  <X size={12} strokeWidth={2} />
                  Remove
                </button>
              </motion.li>
            );
          })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

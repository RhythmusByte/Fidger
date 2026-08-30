"use client";

import { useState } from "react";

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
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-4 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-slate-700 dark:text-slate-200">
          Budgets
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs text-blue-600 dark:text-blue-400 font-medium"
        >
          {showForm ? "Cancel" : "+ Set budget"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-2 mb-3">
          <input
            type="text"
            placeholder="Category (e.g. Food)"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Monthly limit"
            required
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            Save budget
          </button>
        </form>
      )}

      {budgets.length === 0 ? (
        <p className="text-sm text-slate-400">
          No budgets set. Add a category limit to track spending against it.
        </p>
      ) : (
        <ul className="space-y-3">
          {budgets.map((b) => {
            const spent = spendingByCategory[b.category] || 0;
            const pct = Math.min((spent / b.limit) * 100, 100);
            const over = spent > b.limit;
            return (
              <li key={b._id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium dark:text-slate-100">
                    {b.category}
                  </span>
                  <span
                    className={
                      over
                        ? "text-red-600 dark:text-red-400"
                        : "text-slate-500 dark:text-slate-400"
                    }
                  >
                    {spent.toFixed(2)} / {b.limit.toFixed(2)}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${over ? "bg-red-500" : "bg-blue-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <button
                  onClick={() => handleDelete(b._id)}
                  className="text-xs text-red-400 mt-1"
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

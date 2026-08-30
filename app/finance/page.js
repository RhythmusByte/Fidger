"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Pencil, Trash2, Download, ArrowRightLeft, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import Nav from "../../components/Nav";
import AccountsSection from "../../components/AccountsSection";
import BudgetsSection from "../../components/BudgetsSection";
import FinanceCharts from "../../components/FinanceCharts";
import MonthSwitcher from "../../components/MonthSwitcher";

const now = new Date();

export default function FinancePage() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    accountId: "",
    fromAccountId: "",
    toAccountId: "",
    date: now.toISOString().slice(0, 10),
    note: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const [accRes, txRes, budRes] = await Promise.all([
      fetch("/api/accounts"),
      fetch("/api/transactions"),
      fetch("/api/budgets"),
    ]);
    setAccounts(await accRes.json());
    setTransactions(await txRes.json());
    setBudgets(await budRes.json());
    setLoading(false);
  }

  // Running balance per account, computed from starting balance plus
  // every income/expense/transfer that touches it, across all time
  // (balances are always all-time, only the transaction list below is filtered by month).
  const balances = useMemo(() => {
    const map = {};
    accounts.forEach((a) => {
      map[a._id] = a.startingBalance || 0;
    });
    transactions.forEach((t) => {
      if (t.type === "income" && map[t.accountId] !== undefined) {
        map[t.accountId] += t.amount;
      } else if (t.type === "expense" && map[t.accountId] !== undefined) {
        map[t.accountId] -= t.amount;
      } else if (t.type === "transfer") {
        if (map[t.fromAccountId] !== undefined) map[t.fromAccountId] -= t.amount;
        if (map[t.toAccountId] !== undefined) map[t.toAccountId] += t.amount;
      }
    });
    return map;
  }, [accounts, transactions]);

  const totalBalance = Object.values(balances).reduce((s, v) => s + v, 0);

  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [transactions, year, month]);

  const totalIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const spendingByCategory = useMemo(() => {
    const map = {};
    monthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return map;
  }, [monthTransactions]);

  const balanceTrend = useMemo(() => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    let running = accounts.reduce((s, a) => s + (a.startingBalance || 0), 0);
    const points = [];
    sorted.forEach((t) => {
      if (t.type === "income") running += t.amount;
      if (t.type === "expense") running -= t.amount;
      points.push({ date: t.date, balance: running });
    });
    return points;
  }, [transactions, accounts]);

  function accountName(id) {
    return accounts.find((a) => a._id === id)?.name || "Unknown";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      type: form.type,
      amount: form.amount,
      date: form.date,
      note: form.note,
    };

    if (form.type === "transfer") {
      if (!form.fromAccountId || !form.toAccountId) return;
      payload.fromAccountId = form.fromAccountId;
      payload.toAccountId = form.toAccountId;
    } else {
      if (!form.accountId || !form.category) return;
      payload.accountId = form.accountId;
      payload.category = form.category;
    }

    if (editingId) {
      await fetch(`/api/transactions/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setEditingId(null);
    } else {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    loadAll();
  }

  function resetForm() {
    setForm({
      type: "expense",
      amount: "",
      category: "",
      accountId: "",
      fromAccountId: "",
      toAccountId: "",
      date: now.toISOString().slice(0, 10),
      note: "",
    });
  }

  function startEdit(t) {
    setEditingId(t._id);
    setForm({
      type: t.type,
      amount: t.amount,
      category: t.category || "",
      accountId: t.accountId || "",
      fromAccountId: t.fromAccountId || "",
      toAccountId: t.toAccountId || "",
      date: t.date,
      note: t.note || "",
    });
  }

  async function handleDelete(id) {
    if (!confirm("Delete this transaction?")) return;
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    loadAll();
  }

  function handleExport() {
    const blob = new Blob(
      [JSON.stringify({ accounts, transactions, budgets }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="pb-20">
      <Nav />

      <main className="max-w-lg mx-auto px-4 py-4">
        <motion.div
          layout
          className="bg-white dark:bg-surface-card rounded-xl border border-zinc-200 dark:border-surface-border p-4 mb-4 text-center transition-colors"
        >
          <p className="text-xs text-zinc-500 dark:text-ink-muted">
            Total balance across all accounts
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={totalBalance.toFixed(2)}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-bold text-zinc-950 dark:text-ink"
            >
              {totalBalance.toFixed(2)}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        <AccountsSection
          accounts={accounts}
          balances={balances}
          onChange={loadAll}
        />

        <MonthSwitcher
          year={year}
          month={month}
          onChange={(y, m) => {
            setYear(y);
            setMonth(m);
          }}
        />

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white dark:bg-surface-card rounded-xl border border-zinc-200 dark:border-surface-border p-3 text-center transition-colors">
            <p className="text-xs text-zinc-500 dark:text-ink-muted">
              Income this month
            </p>
            <p className="font-semibold text-green-600 dark:text-green-400">
              {totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-surface-card rounded-xl border border-zinc-200 dark:border-surface-border p-3 text-center transition-colors">
            <p className="text-xs text-zinc-500 dark:text-ink-muted">
              Expense this month
            </p>
            <p className="font-semibold text-red-600 dark:text-red-400">
              {totalExpense.toFixed(2)}
            </p>
          </div>
        </div>

        <FinanceCharts
          spendingByCategory={spendingByCategory}
          balanceTrend={balanceTrend}
        />

        <BudgetsSection
          budgets={budgets}
          spendingByCategory={spendingByCategory}
          onChange={loadAll}
        />

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-surface-card rounded-xl border border-zinc-200 dark:border-surface-border p-4 mb-4 space-y-3 transition-colors"
        >
          <div className="flex gap-2">
            {["expense", "income", "transfer"].map((t) => {
              const TIcon = t === "expense" ? ArrowDownCircle : t === "income" ? ArrowUpCircle : ArrowRightLeft;
              return (
              <motion.button
                key={t}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setForm({ ...form, type: t })}
                className={`relative flex items-center justify-center gap-1.5 flex-1 py-2 rounded-lg text-sm font-medium capitalize overflow-hidden ${
                  form.type === t
                    ? t === "expense"
                      ? "text-red-700 dark:text-red-300"
                      : t === "income"
                      ? "text-green-700 dark:text-green-300"
                      : "text-accent-hover dark:text-accent"
                    : "text-zinc-500 dark:text-ink-muted"
                }`}
              >
                {form.type === t && (
                  <motion.span
                    layoutId="type-pill"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    className={`absolute inset-0 -z-10 ${
                      t === "expense"
                        ? "bg-red-100 dark:bg-red-900/40"
                        : t === "income"
                        ? "bg-green-100 dark:bg-green-900/40"
                        : "bg-accent/10 dark:bg-accent/20"
                    }`}
                  />
                )}
                {form.type !== t && (
                  <span className="absolute inset-0 -z-10 bg-zinc-50 dark:bg-surface-elevated rounded-lg" />
                )}
                <TIcon size={15} strokeWidth={2} />
                {t}
              </motion.button>
              );
            })}
          </div>

          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-zinc-400 dark:border-surface-borderStrong dark:bg-surface-elevated dark:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          />

          {form.type === "transfer" ? (
            <>
              <select
                required
                value={form.fromAccountId}
                onChange={(e) => setForm({ ...form, fromAccountId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-400 dark:border-surface-borderStrong dark:bg-surface-elevated dark:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">From account</option>
                {accounts.map((a) => (
                  <option key={a._id} value={a._id}>{a.name}</option>
                ))}
              </select>
              <select
                required
                value={form.toAccountId}
                onChange={(e) => setForm({ ...form, toAccountId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-400 dark:border-surface-borderStrong dark:bg-surface-elevated dark:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">To account</option>
                {accounts.map((a) => (
                  <option key={a._id} value={a._id}>{a.name}</option>
                ))}
              </select>
            </>
          ) : (
            <>
              <select
                required
                value={form.accountId}
                onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-400 dark:border-surface-borderStrong dark:bg-surface-elevated dark:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Account</option>
                {accounts.map((a) => (
                  <option key={a._id} value={a._id}>{a.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Category (e.g. Food, Bills, Transport)"
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-400 dark:border-surface-borderStrong dark:bg-surface-elevated dark:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </>
          )}

          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-zinc-400 dark:border-surface-borderStrong dark:bg-surface-elevated dark:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <input
            type="text"
            placeholder="Note (optional)"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-zinc-400 dark:border-surface-borderStrong dark:bg-surface-elevated dark:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="flex-1 bg-accent text-white py-2 rounded-lg font-medium hover:bg-accent-hover"
            >
              {editingId ? "Update" : "Add"}
            </motion.button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  resetForm();
                }}
                className="px-4 py-2 rounded-lg bg-zinc-50 dark:bg-surface-elevated text-zinc-700 dark:text-ink-muted"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-zinc-800 dark:text-ink">
            Transactions this month
          </h2>
          <button
            onClick={handleExport}
            className="flex items-center gap-1 text-xs text-accent dark:text-accent font-medium"
          >
            <Download size={13} strokeWidth={2} />
            Export JSON
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-zinc-400">Loading...</p>
        ) : monthTransactions.length === 0 ? (
          <p className="text-sm text-zinc-400">No transactions this month.</p>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
            {monthTransactions.map((t) => (
              <motion.li
                key={t._id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-surface-card rounded-xl border border-zinc-200 dark:border-surface-border p-3 flex items-center justify-between transition-colors"
              >
                <div>
                  <p className="text-sm font-medium dark:text-ink">
                    {t.type === "transfer"
                      ? `${accountName(t.fromAccountId)} \u2192 ${accountName(t.toAccountId)}`
                      : t.category}{" "}
                    <span className="text-xs text-zinc-400">{t.date}</span>
                  </p>
                  {t.type !== "transfer" && (
                    <p className="text-xs text-zinc-400">{accountName(t.accountId)}</p>
                  )}
                  {t.note && (
                    <p className="text-xs text-zinc-400">{t.note}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-semibold text-sm ${
                      t.type === "income"
                        ? "text-green-600 dark:text-green-400"
                        : t.type === "expense"
                        ? "text-red-600 dark:text-red-400"
                        : "text-accent dark:text-accent"
                    }`}
                  >
                    {t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}
                    {t.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => startEdit(t)}
                    aria-label="Edit transaction"
                    className="text-zinc-400 hover:text-accent dark:hover:text-accent"
                  >
                    <Pencil size={14} strokeWidth={1.75} />
                  </button>
                  <button
                    onClick={() => handleDelete(t._id)}
                    aria-label="Delete transaction"
                    className="text-red-300 hover:text-red-500"
                  >
                    <Trash2 size={14} strokeWidth={1.75} />
                  </button>
                </div>
              </motion.li>
            ))}
            </AnimatePresence>
          </ul>
        )}
      </main>
    </div>
  );
}

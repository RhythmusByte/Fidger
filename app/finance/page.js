"use client";

import { useEffect, useMemo, useState } from "react";
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
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-4 text-center transition-colors">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total balance across all accounts
          </p>
          <p className="text-2xl font-bold dark:text-slate-100">
            {totalBalance.toFixed(2)}
          </p>
        </div>

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
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center transition-colors">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Income this month
            </p>
            <p className="font-semibold text-green-600 dark:text-green-400">
              {totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center transition-colors">
            <p className="text-xs text-slate-500 dark:text-slate-400">
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
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-4 space-y-3 transition-colors"
        >
          <div className="flex gap-2">
            {["expense", "income", "transfer"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, type: t })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize ${
                  form.type === t
                    ? t === "expense"
                      ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                      : t === "income"
                      ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                      : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {form.type === "transfer" ? (
            <>
              <select
                required
                value={form.fromAccountId}
                onChange={(e) => setForm({ ...form, fromAccountId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}

          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="Note (optional)"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
            >
              {editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  resetForm();
                }}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200">
            Transactions this month
          </h2>
          <button
            onClick={handleExport}
            className="text-xs text-blue-600 dark:text-blue-400 font-medium"
          >
            Export JSON
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : monthTransactions.length === 0 ? (
          <p className="text-sm text-slate-400">No transactions this month.</p>
        ) : (
          <ul className="space-y-2">
            {monthTransactions.map((t) => (
              <li
                key={t._id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 flex items-center justify-between transition-colors"
              >
                <div>
                  <p className="text-sm font-medium dark:text-slate-100">
                    {t.type === "transfer"
                      ? `${accountName(t.fromAccountId)} \u2192 ${accountName(t.toAccountId)}`
                      : t.category}{" "}
                    <span className="text-xs text-slate-400">{t.date}</span>
                  </p>
                  {t.type !== "transfer" && (
                    <p className="text-xs text-slate-400">{accountName(t.accountId)}</p>
                  )}
                  {t.note && (
                    <p className="text-xs text-slate-400">{t.note}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-semibold text-sm ${
                      t.type === "income"
                        ? "text-green-600 dark:text-green-400"
                        : t.type === "expense"
                        ? "text-red-600 dark:text-red-400"
                        : "text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}
                    {t.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => startEdit(t)}
                    className="text-xs text-slate-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t._id)}
                    className="text-xs text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

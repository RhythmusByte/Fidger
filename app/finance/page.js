"use client";

import { useEffect, useState } from "react";
import Nav from "../../components/Nav";

export default function FinancePage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    date: new Date().toISOString().slice(0, 10),
    note: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    setLoading(true);
    const res = await fetch("/api/transactions");
    const data = await res.json();
    setTransactions(data);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount || !form.category) return;

    if (editingId) {
      await fetch(`/api/transactions/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setEditingId(null);
    } else {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setForm({
      type: "expense",
      amount: "",
      category: "",
      date: new Date().toISOString().slice(0, 10),
      note: "",
    });
    loadTransactions();
  }

  function startEdit(t) {
    setEditingId(t._id);
    setForm({
      type: t.type,
      amount: t.amount,
      category: t.category,
      date: t.date,
      note: t.note || "",
    });
  }

  async function handleDelete(id) {
    if (!confirm("Delete this transaction?")) return;
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    loadTransactions();
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(transactions, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="pb-20">
      <Nav />

      <main className="max-w-lg mx-auto px-4 py-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
            <p className="text-xs text-slate-500">Income</p>
            <p className="font-semibold text-green-600">
              {totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
            <p className="text-xs text-slate-500">Expense</p>
            <p className="font-semibold text-red-600">
              {totalExpense.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
            <p className="text-xs text-slate-500">Balance</p>
            <p
              className={`font-semibold ${
                balance >= 0 ? "text-slate-800" : "text-red-600"
              }`}
            >
              {balance.toFixed(2)}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-slate-200 p-4 mb-4 space-y-3"
        >
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "expense" })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                form.type === "expense"
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "income" })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                form.type === "income"
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              Income
            </button>
          </div>

          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="Category (e.g. Food, Bills, Transport)"
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="Note (optional)"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  setForm({
                    type: "expense",
                    amount: "",
                    category: "",
                    date: new Date().toISOString().slice(0, 10),
                    note: "",
                  });
                }}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-slate-700">Transactions</h2>
          <button
            onClick={handleExport}
            className="text-xs text-blue-600 font-medium"
          >
            Export JSON
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-slate-400">No transactions yet.</p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((t) => (
              <li
                key={t._id}
                className="bg-white rounded-xl border border-slate-200 p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium">
                    {t.category}{" "}
                    <span className="text-xs text-slate-400">{t.date}</span>
                  </p>
                  {t.note && (
                    <p className="text-xs text-slate-400">{t.note}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-semibold text-sm ${
                      t.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
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

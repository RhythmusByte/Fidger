"use client";

import { useState } from "react";

const TYPE_LABELS = {
  cash: "Cash",
  bank: "Bank",
  ewallet: "E-wallet",
  credit: "Credit",
};

export default function AccountsSection({ accounts, balances, onChange }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "cash", startingBalance: "" });
  const [editingId, setEditingId] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name) return;

    if (editingId) {
      await fetch(`/api/accounts/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setForm({ name: "", type: "cash", startingBalance: "" });
    setEditingId(null);
    setShowForm(false);
    onChange();
  }

  function startEdit(a) {
    setEditingId(a._id);
    setForm({ name: a.name, type: a.type, startingBalance: a.startingBalance });
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this account?")) return;
    const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Could not delete this account.");
      return;
    }
    onChange();
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-4 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-slate-700 dark:text-slate-200">
          Accounts
        </h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ name: "", type: "cash", startingBalance: "" });
          }}
          className="text-xs text-blue-600 dark:text-blue-400 font-medium"
        >
          {showForm ? "Cancel" : "+ Add account"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-2 mb-3">
          <input
            type="text"
            placeholder="Account name (e.g. Wallet, BDO Savings)"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="ewallet">E-wallet</option>
            <option value="credit">Credit</option>
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Starting balance"
            value={form.startingBalance}
            onChange={(e) => setForm({ ...form, startingBalance: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            {editingId ? "Update account" : "Add account"}
          </button>
        </form>
      )}

      {accounts.length === 0 ? (
        <p className="text-sm text-slate-400">
          No accounts yet. Add one to start tracking balances.
        </p>
      ) : (
        <ul className="space-y-2">
          {accounts.map((a) => (
            <li
              key={a._id}
              className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 rounded-lg px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium dark:text-slate-100">
                  {a.name}{" "}
                  <span className="text-xs text-slate-400 dark:text-slate-400">
                    {TYPE_LABELS[a.type]}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm dark:text-slate-100">
                  {(balances[a._id] ?? a.startingBalance).toFixed(2)}
                </span>
                <button
                  onClick={() => startEdit(a)}
                  className="text-xs text-slate-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(a._id)}
                  className="text-xs text-red-400"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

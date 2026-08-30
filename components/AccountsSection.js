"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wallet, Landmark, Smartphone, CreditCard, Plus, Pencil, Trash2, Check } from "lucide-react";

const TYPE_LABELS = {
  cash: "Cash",
  bank: "Bank",
  ewallet: "E-wallet",
  credit: "Credit",
};

const TYPE_ICONS = {
  cash: Wallet,
  bank: Landmark,
  ewallet: Smartphone,
  credit: CreditCard,
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
    <div className="bg-white dark:bg-surface-card rounded-xl border border-zinc-200 dark:border-surface-border p-4 mb-4 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-zinc-800 dark:text-ink">
          Accounts
        </h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ name: "", type: "cash", startingBalance: "" });
          }}
          className="flex items-center gap-1 text-xs text-accent dark:text-accent font-medium"
        >
          {showForm ? "Cancel" : (<><Plus size={14} strokeWidth={2.5} /> Add account</>)}
        </button>
      </div>

      <AnimatePresence>
      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleSubmit} className="space-y-2 mb-3 overflow-hidden">
          <input
            type="text"
            placeholder="Account name (e.g. Wallet, BDO Savings)"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-zinc-400 dark:border-surface-borderStrong dark:bg-surface-elevated dark:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-zinc-400 dark:border-surface-borderStrong dark:bg-surface-elevated dark:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
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
            className="w-full px-3 py-2 rounded-lg border border-zinc-400 dark:border-surface-borderStrong dark:bg-surface-elevated dark:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 bg-accent text-white py-2 rounded-lg font-medium hover:bg-accent-hover"
          >
            <Check size={16} strokeWidth={2} />
            {editingId ? "Update account" : "Add account"}
          </motion.button>
        </motion.form>
      )}
      </AnimatePresence>

      {accounts.length === 0 ? (
        <p className="text-sm text-zinc-400">
          No accounts yet. Add one to start tracking balances.
        </p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence>
          {accounts.map((a) => {
            const TypeIcon = TYPE_ICONS[a.type] || Wallet;
            return (
            <motion.li
              key={a._id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center justify-between bg-zinc-50 dark:bg-surface-elevated rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent/10 dark:bg-accent/20 flex items-center justify-center shrink-0">
                  <TypeIcon size={16} strokeWidth={1.75} className="text-accent dark:text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium dark:text-ink">
                    {a.name}
                  </p>
                  <span className="text-xs text-zinc-400 dark:text-ink-muted">
                    {TYPE_LABELS[a.type]}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm dark:text-ink">
                  {(balances[a._id] ?? a.startingBalance).toFixed(2)}
                </span>
                <button
                  onClick={() => startEdit(a)}
                  aria-label="Edit account"
                  className="text-zinc-400 hover:text-accent dark:hover:text-accent"
                >
                  <Pencil size={14} strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => handleDelete(a._id)}
                  aria-label="Delete account"
                  className="text-red-300 hover:text-red-500"
                >
                  <Trash2 size={14} strokeWidth={1.75} />
                </button>
              </div>
            </motion.li>
            );
          })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2 } from "lucide-react";
import Nav from "../../components/Nav";

export default function TodosPage() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");

  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    setLoading(true);
    const res = await fetch("/api/todos");
    const data = await res.json();
    setTodos(data);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;

    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    setText("");
    loadTodos();
  }

  async function toggleDone(todo) {
    await fetch(`/api/todos/${todo._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !todo.done }),
    });
    loadTodos();
  }

  async function handleDelete(id) {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    loadTodos();
  }

  const pending = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  return (
    <div className="pb-20">
      <Nav />

      <main className="max-w-lg mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Add a to-do..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-zinc-400 dark:border-surface-borderStrong dark:bg-surface-elevated dark:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            className="flex items-center gap-1.5 bg-accent text-white px-4 py-2 rounded-lg font-medium hover:bg-accent-hover"
          >
            <Plus size={16} strokeWidth={2} />
            Add
          </motion.button>
        </form>

        {loading ? (
          <p className="text-sm text-zinc-400">Loading...</p>
        ) : (
          <>
            <ul className="space-y-2 mb-6">
              <AnimatePresence>
              {pending.map((t) => (
                <motion.li
                  key={t._id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white dark:bg-surface-card rounded-xl border border-zinc-200 dark:border-surface-border p-3 flex items-center gap-3 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => toggleDone(t)}
                    className="w-5 h-5 accent-purple-600"
                  />
                  <span className="flex-1 text-sm text-zinc-950 dark:text-ink">
                    {t.text}
                  </span>
                  <button
                    onClick={() => handleDelete(t._id)}
                    aria-label="Delete todo"
                    className="text-red-300 hover:text-red-500"
                  >
                    <Trash2 size={14} strokeWidth={1.75} />
                  </button>
                </motion.li>
              ))}
              </AnimatePresence>
              {pending.length === 0 && (
                <p className="text-sm text-zinc-400">
                  Nothing pending. Nice.
                </p>
              )}
            </ul>

            {done.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-zinc-400 dark:text-ink0 mb-2">
                  Completed
                </h2>
                <ul className="space-y-2">
                  <AnimatePresence>
                  {done.map((t) => (
                    <motion.li
                      key={t._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-zinc-50 dark:bg-surface-elevated/60 rounded-xl border border-zinc-200 dark:border-surface-border p-3 flex items-center gap-3 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => toggleDone(t)}
                        className="w-5 h-5 accent-purple-600"
                      />
                      <span className="flex-1 text-sm line-through text-zinc-400 dark:text-ink0">
                        {t.text}
                      </span>
                      <button
                        onClick={() => handleDelete(t._id)}
                        aria-label="Delete todo"
                        className="text-red-300 hover:text-red-500"
                      >
                        <Trash2 size={14} strokeWidth={1.75} />
                      </button>
                    </motion.li>
                  ))}
                  </AnimatePresence>
                </ul>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
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
            className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            Add
          </button>
        </form>

        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : (
          <>
            <ul className="space-y-2 mb-6">
              {pending.map((t) => (
                <li
                  key={t._id}
                  className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-3"
                >
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => toggleDone(t)}
                    className="w-5 h-5"
                  />
                  <span className="flex-1 text-sm">{t.text}</span>
                  <button
                    onClick={() => handleDelete(t._id)}
                    className="text-xs text-red-400"
                  >
                    Delete
                  </button>
                </li>
              ))}
              {pending.length === 0 && (
                <p className="text-sm text-slate-400">
                  Nothing pending. Nice.
                </p>
              )}
            </ul>

            {done.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-slate-400 mb-2">
                  Completed
                </h2>
                <ul className="space-y-2">
                  {done.map((t) => (
                    <li
                      key={t._id}
                      className="bg-slate-100 rounded-xl border border-slate-200 p-3 flex items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => toggleDone(t)}
                        className="w-5 h-5"
                      />
                      <span className="flex-1 text-sm line-through text-slate-400">
                        {t.text}
                      </span>
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="text-xs text-red-400"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

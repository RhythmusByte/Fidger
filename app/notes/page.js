"use client";

import { useEffect, useState } from "react";
import Nav from "../../components/Nav";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    setLoading(true);
    const res = await fetch("/api/notes");
    const data = await res.json();
    setNotes(data);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    if (editingId) {
      await fetch(`/api/notes/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      setEditingId(null);
    } else {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
    }

    setTitle("");
    setContent("");
    loadNotes();
  }

  function startEdit(n) {
    setEditingId(n._id);
    setTitle(n.title);
    setContent(n.content);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    loadNotes();
  }

  return (
    <div className="pb-20">
      <Nav />

      <main className="max-w-lg mx-auto px-4 py-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-slate-200 p-4 mb-4 space-y-3"
        >
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Write your note..."
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
            >
              {editingId ? "Update" : "Add note"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setTitle("");
                  setContent("");
                }}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-slate-400">No notes yet.</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((n) => (
              <li
                key={n._id}
                className="bg-white rounded-xl border border-slate-200 p-3"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-sm">{n.title}</h3>
                  <div className="flex gap-3 shrink-0 ml-2">
                    <button
                      onClick={() => startEdit(n)}
                      className="text-xs text-slate-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(n._id)}
                      className="text-xs text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {n.content && (
                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">
                    {n.content}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

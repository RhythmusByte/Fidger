"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import Nav from "../../components/Nav";
import MarkdownView from "../../components/MarkdownView";
import NoteEditorModal from "../../components/NoteEditorModal";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openNote, setOpenNote] = useState(null); // null = closed, {} = new, object = editing

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

  async function handleSave({ id, title, content }) {
    if (id) {
      await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
    } else {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
    }
    setOpenNote(null);
    loadNotes();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setOpenNote(null);
    loadNotes();
  }

  return (
    <div className="pb-24">
      <Nav />

      <main className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-zinc-950 dark:text-ink">
            Notes
          </h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => setOpenNote({})}
            className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            <Plus size={16} strokeWidth={2} />
            New note
          </motion.button>
        </div>

        {loading ? (
          <p className="text-sm text-zinc-400">Loading...</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-zinc-400">
            No notes yet. Start one above.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnimatePresence>
              {notes.map((n, i) => (
                <motion.button
                  key={n._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  whileHover={{ y: -2 }}
                  onClick={() => setOpenNote(n)}
                  className="text-left bg-white dark:bg-surface-card border border-zinc-200 dark:border-surface-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow max-h-48 overflow-hidden relative"
                >
                  <h3 className="font-semibold text-sm text-zinc-950 dark:text-ink mb-1 truncate">
                    {n.title || "Untitled"}
                  </h3>
                  <div className="line-clamp-4 text-xs">
                    <MarkdownView content={n.content} />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent" />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <AnimatePresence>
        {openNote && (
          <NoteEditorModal
            note={openNote}
            onClose={() => setOpenNote(null)}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

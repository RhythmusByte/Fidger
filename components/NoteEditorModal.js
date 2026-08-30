"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Trash2 } from "lucide-react";
import MarkdownView from "./MarkdownView";

export default function NoteEditorModal({ note, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(note?.title === "Untitled" ? "" : note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [tab, setTab] = useState("write");
  const isNew = !note?._id;

  function handleSave() {
    if (!title.trim() && !content.trim()) {
      onClose();
      return;
    }
    onSave({ id: note?._id, title, content });
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-zinc-950/40 dark:bg-black/60 backdrop-blur-sm z-30 flex items-end sm:items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-surface-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-xl border border-zinc-200 dark:border-surface-border flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-surface-border">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 font-semibold text-zinc-950 dark:text-ink bg-transparent focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-ink-faint"
            />
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-ink-muted p-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-surface-elevated"
            >
              <X size={18} strokeWidth={1.75} />
            </button>
          </div>

          <div className="flex gap-1 px-4 pt-3">
            {["write", "preview"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium capitalize transition-colors ${
                  tab === t
                    ? "bg-accent/10 dark:bg-accent/20 text-accent-hover dark:text-accent"
                    : "text-zinc-400 dark:text-ink0"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {tab === "write" ? (
              <textarea
                autoFocus
                placeholder="Write in Markdown... **bold**, _italic_, `code`, - lists, [links](url)"
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full min-h-[240px] bg-transparent text-sm text-zinc-900 dark:text-ink focus:outline-none resize-none font-mono placeholder:text-zinc-400 dark:placeholder:text-ink-faint"
              />
            ) : (
              <MarkdownView content={content} />
            )}
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-surface-border">
            {!isNew ? (
              <button
                onClick={() => onDelete(note._id)}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium"
              >
                <Trash2 size={16} strokeWidth={1.75} />
                Delete
              </button>
            ) : (
              <span />
            )}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleSave}
              className="bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-lg text-sm font-medium"
            >
              Save
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

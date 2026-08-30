"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

// Renders markdown safely (react-markdown never uses dangerouslySetInnerHTML).
// Styled to match the purple theme and read well at note-card size.
export default function MarkdownView({ content }) {
  if (!content) {
    return (
      <p className="text-sm text-zinc-400 dark:text-ink0 italic">
        Nothing here yet.
      </p>
    );
  }

  return (
    <div
      className="prose prose-sm max-w-none prose-violet dark:prose-invert
        prose-headings:text-zinc-900 dark:prose-headings:text-zinc-200
        prose-p:text-zinc-800 dark:prose-p:text-zinc-300
        prose-a:text-accent dark:prose-a:text-accent
        prose-strong:text-zinc-900 dark:prose-strong:text-zinc-200
        prose-code:text-accent-hover dark:prose-code:text-accent
        prose-code:bg-zinc-50 dark:prose-code:bg-zinc-950
        prose-li:text-zinc-800 dark:prose-li:text-zinc-300
        prose-blockquote:border-accent/40 dark:prose-blockquote:border-accent/40"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{content}</ReactMarkdown>
    </div>
  );
}

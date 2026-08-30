"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-surface dark:via-surface-card dark:to-surface transition-colors">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white dark:bg-surface-card p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-surface-border transition-colors text-zinc-950 dark:text-ink"
      >
        <h1 className="text-xl font-semibold mb-2 text-center">
          Create account
        </h1>
        <p className="text-xs text-zinc-500 dark:text-ink-muted mb-6 text-center">
          This page is not linked anywhere in the app. Keep this URL private.
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {success && (
          <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            Account created. Redirecting to login...
          </p>
        )}

        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg border border-zinc-400 dark:border-surface-borderStrong dark:bg-surface-elevated dark:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg border border-zinc-400 dark:border-surface-borderStrong dark:bg-surface-elevated dark:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <label className="block text-sm font-medium mb-1">
          Password (min 8 characters)
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-3 py-2 rounded-lg border border-zinc-400 dark:border-surface-borderStrong dark:bg-surface-elevated dark:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white py-2 rounded-lg font-medium hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
    </div>
  );
}

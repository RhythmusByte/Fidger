"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/finance");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-surface dark:via-surface-card dark:to-surface transition-colors">
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white dark:bg-surface-card p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-surface-border transition-colors"
      >
        <h1 className="text-xl font-semibold mb-6 text-center text-zinc-950 dark:text-ink">
          Sign in
        </h1>

        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2"
          >
            {error}
          </motion.p>
        )}

        <label className="block text-sm font-medium mb-1 text-zinc-800 dark:text-ink-muted">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg border border-zinc-400 dark:border-surface-borderStrong dark:bg-surface-elevated dark:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <label className="block text-sm font-medium mb-1 text-zinc-800 dark:text-ink-muted">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-3 py-2 rounded-lg border border-zinc-400 dark:border-surface-borderStrong dark:bg-surface-elevated dark:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white py-2 rounded-lg font-medium hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </motion.button>
      </motion.form>
    </div>
  );
}

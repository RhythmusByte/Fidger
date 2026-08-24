"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setErrorMessage(data.error || "Login failed");
        setIsSubmitting(false);
        return;
      }
      const redirectTo = searchParams.get("redirectTo") || "/dashboard";
      router.push(redirectTo);
      router.refresh();
    } catch {
      setErrorMessage("Could not reach the server. Try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="fidgerCard fidgerFadeIn w-full max-w-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--fidgerAccent)]/20 flex items-center justify-center">
            <Lock size={20} className="text-[var(--fidgerAccent)]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Fidger</h1>
            <p className="fidgerHelperText">Owner-only access</p>
          </div>
        </div>

        <label htmlFor="password" className="block text-sm mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="fidgerInput mb-4"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoFocus
          required
        />

        {errorMessage ? (
          <p className="fidgerNegativeText text-sm mb-4" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <button type="submit" className="fidgerButtonPrimary w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

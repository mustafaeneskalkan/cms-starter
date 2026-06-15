"use client";

import React, { useState } from "react";
import { useSession } from "../../contexts/session/SessionContext";

export default function PasswordResetRequestForm(): React.ReactElement {
  const { requestPasswordReset } = useSession();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setSubmitting(true);

    const result = await requestPasswordReset({ email });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setMessage(result.data.message);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-10 w-full rounded-md border border-foreground/15 bg-background px-3 text-sm outline-none focus:border-foreground/40"
          autoComplete="email"
        />
      </div>

      {error && (
        <p className="rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm">
          {error}
        </p>
      )}

      {message && (
        <p className="rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send reset email"}
      </button>

      <p className="text-xs text-foreground/60">
        If the account exists, you’ll receive an email with a reset link.
      </p>
    </form>
  );
}

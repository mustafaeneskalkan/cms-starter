"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useSession } from "../../contexts/session/SessionContext";

export default function PasswordResetForm({
  initialToken = "",
}: {
  initialToken?: string;
}): React.ReactElement {
  const router = useRouter();
  const { resetPassword } = useSession();

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setSubmitting(true);

    const result = await resetPassword({ token, newPassword });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setMessage(result.data.message);
    router.push("/login");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="token">
          Reset token
        </label>
        <input
          id="token"
          name="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          className="h-10 w-full rounded-md border border-foreground/15 bg-background px-3 text-sm outline-none focus:border-foreground/40"
          autoComplete="one-time-code"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="newPassword">
          New password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          className="h-10 w-full rounded-md border border-foreground/15 bg-background px-3 text-sm outline-none focus:border-foreground/40"
          autoComplete="new-password"
        />
        <p className="text-xs text-foreground/60">Minimum 8 characters.</p>
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
        {submitting ? "Resetting…" : "Reset password"}
      </button>
    </form>
  );
}

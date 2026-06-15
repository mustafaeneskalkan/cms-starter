"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useSession } from "../../contexts/session/SessionContext";

export default function LoginForm({
  nextPath = "/cms",
  onRequestSignup,
  onRequestReset,
  onSuccess,
}: {
  nextPath?: string;
  onRequestSignup?: () => void;
  onRequestReset?: () => void;
  onSuccess?: () => void;
}): React.ReactElement {
  const router = useRouter();
  const { login } = useSession();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await login({ usernameOrEmail, password });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onSuccess?.();
    router.push(nextPath);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="usernameOrEmail">
          Username or email
        </label>
        <input
          id="usernameOrEmail"
          name="usernameOrEmail"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          required
          className="h-10 w-full rounded-md border border-foreground/15 bg-background px-3 text-sm outline-none focus:border-foreground/40"
          autoComplete="username"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="h-10 w-full rounded-md border border-foreground/15 bg-background px-3 text-sm outline-none focus:border-foreground/40"
          autoComplete="current-password"
        />
      </div>

      {error && (
        <p className="rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Signing in…" : "Login"}
      </button>

      <div className="flex items-center justify-between text-sm text-foreground/70">
        <button
          type="button"
          onClick={() => {
            if (onRequestSignup) {
              onRequestSignup();
              return;
            }

            router.push("/register");
          }}
          className="hover:text-foreground"
        >
          Create an account
        </button>
        <button
          type="button"
          onClick={() => {
            if (onRequestReset) {
              onRequestReset();
              return;
            }

            router.push("/reset-password");
          }}
          className="hover:text-foreground"
        >
          Forgot password?
        </button>
      </div>
    </form>
  );
}

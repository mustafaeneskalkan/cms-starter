"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useSession } from "../../contexts/session/SessionContext";

export default function SignupForm({
  onRequestLogin,
  onSuccess,
}: {
  onRequestLogin?: () => void;
  onSuccess?: () => void;
}): React.ReactElement {
  const router = useRouter();
  const { register } = useSession();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await register({
      username,
      email,
      password,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onSuccess?.();
    router.push("/cms");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          className="h-10 w-full rounded-md border border-foreground/15 bg-background px-3 text-sm outline-none focus:border-foreground/40"
          autoComplete="username"
        />
      </div>

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

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Creating account…" : "Sign up"}
      </button>

      <div className="flex items-center justify-between text-sm text-foreground/70">
        <button
          type="button"
          onClick={() => {
            if (onRequestLogin) {
              onRequestLogin();
              return;
            }

            router.push("/login");
          }}
          className="hover:text-foreground"
        >
          Already have an account?
        </button>
      </div>
    </form>
  );
}

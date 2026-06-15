"use client";

import PasswordResetForm from "@/components/auth/PasswordResetForm";
import PasswordResetRequestForm from "@/components/auth/PasswordResetRequestForm";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const tokenFromQuery = searchParams.get("token") ?? "";
  const [mode, setMode] = useState<"request" | "reset">(
    tokenFromQuery ? "reset" : "request",
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            {mode === "request" ? "Reset password" : "Set new password"}
          </h1>
          <p className="text-sm text-foreground/70">
            {mode === "request"
              ? "Enter your email to receive a reset link."
              : "Enter the token from your email and choose a new password."}
          </p>
        </div>

        {mode === "request" ? (
          <>
            <PasswordResetRequestForm />
            <button
              type="button"
              onClick={() => setMode("reset")}
              className="w-full text-center text-sm text-foreground/70 hover:text-foreground"
            >
              Already have a token?
            </button>
          </>
        ) : (
          <>
            <PasswordResetForm initialToken={tokenFromQuery} />
            <button
              type="button"
              onClick={() => setMode("request")}
              className="w-full text-center text-sm text-foreground/70 hover:text-foreground"
            >
              Request a new reset email
            </button>
          </>
        )}

        <p className="text-center text-sm text-foreground/70">
          <Link href="/login" className="hover:text-foreground">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-sm text-foreground/70">
          Loading…
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

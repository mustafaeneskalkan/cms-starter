"use client";

import LoginForm from "@/components/auth/LoginForm";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/cms";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-foreground">CMS Login</h1>
          <p className="text-sm text-foreground/70">
            Sign in with an Admin account to access the CMS.
          </p>
        </div>
        <LoginForm nextPath={nextPath} />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-sm text-foreground/70">
          Loading…
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

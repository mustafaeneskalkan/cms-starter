"use client";

import SignupForm from "@/components/auth/SignupForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-foreground">Create account</h1>
          <p className="text-sm text-foreground/70">
            New accounts need the Admin role to access the CMS.
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/contexts/session/SessionContext";

export default function Home() {
  const router = useRouter();
  const { loading, session } = useSession();

  useEffect(() => {
    if (loading) return;
    router.replace(session ? "/cms" : "/login");
  }, [loading, session, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-foreground/70">
      Redirecting…
    </div>
  );
}

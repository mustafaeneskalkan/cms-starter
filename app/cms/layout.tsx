"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import {
  CMS_ACCESS_DENIED_MESSAGE,
  useSession,
} from "@/contexts/session/SessionContext";

const navItems = [
  { href: "/cms", label: "Dashboard" },
  { href: "/cms/admin/sessions", label: "Session stats" },
];

export default function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, session, logout, refreshSession } = useSession();

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-foreground/70">
        Loading CMS…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 text-center">
        <div className="space-y-4">
          <p className="text-sm text-foreground/70">
            {CMS_ACCESS_DENIED_MESSAGE}
          </p>
          <Link
            href="/login"
            className="inline-flex rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-56 flex-col border-r border-foreground/10 bg-background">
        <div className="border-b border-foreground/10 px-4 py-5">
          <p className="text-sm font-semibold text-foreground">CMS</p>
          <p className="truncate text-xs text-foreground/60">
            {session.user.username}
          </p>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const active =
              item.href === "/cms"
                ? pathname === "/cms"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm ${
                  active
                    ? "bg-foreground text-background"
                    : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-foreground/10 p-3">
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
          >
            Log out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-foreground/10 px-6 py-4">
          <p className="text-sm text-foreground/60">
            Signed in as{" "}
            <span className="font-medium text-foreground">
              {session.user.email}
            </span>
          </p>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

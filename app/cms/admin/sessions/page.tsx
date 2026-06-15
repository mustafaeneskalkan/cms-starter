"use client";

import { useEffect, useState } from "react";
import type { AdminSessionStatsResponse } from "@/lib/backend/types";
import { useSession } from "@/contexts/session/SessionContext";

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-foreground/10 p-4">
      <p className="text-sm text-foreground/60">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

export default function AdminSessionsPage() {
  const { fetchAdminSessionStats } = useSession();
  const [stats, setStats] = useState<AdminSessionStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await fetchAdminSessionStats();
      if (cancelled) return;

      setLoading(false);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setStats(result.data);
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchAdminSessionStats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Session stats</h1>
        <p className="mt-1 text-sm text-foreground/70">
          Live data from GET /api/admin/sessions/stats
        </p>
      </div>

      {loading && (
        <p className="text-sm text-foreground/70">Loading stats…</p>
      )}

      {error && (
        <p className="rounded-md border border-foreground/15 px-3 py-2 text-sm text-foreground">
          {error}
        </p>
      )}

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total users" value={stats.totalUsers} />
          <StatCard
            label="Users with active sessions"
            value={stats.usersWithActiveSessions}
          />
          <StatCard
            label="Total active sessions"
            value={stats.totalActiveSessions}
          />
          <StatCard label="Expired sessions" value={stats.expiredSessions} />
        </div>
      )}
    </div>
  );
}

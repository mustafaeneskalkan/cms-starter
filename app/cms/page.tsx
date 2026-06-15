export default function CmsDashboardPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-foreground/70">
          CMS starter template — add your content modules here.
        </p>
      </div>

      <div className="rounded-lg border border-foreground/10 p-6">
        <h2 className="text-sm font-semibold text-foreground">Getting started</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-foreground/70">
          <li>Auth is proxied to the backend via Next.js rewrites.</li>
          <li>Route protection uses proxy.ts (accessToken cookie check).</li>
          <li>Admin role is enforced in the session layer.</li>
          <li>
            See{" "}
            <a
              href="/cms/admin/sessions"
              className="text-foreground underline underline-offset-2"
            >
              Session stats
            </a>{" "}
            for a demo admin API call.
          </li>
        </ul>
      </div>
    </div>
  );
}

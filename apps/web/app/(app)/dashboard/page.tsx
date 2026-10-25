'use client';

import { useSessionStore } from '../../../lib/session-store';

export default function DashboardPage() {
  const displayName = useSessionStore((s) => s.me?.user.displayName);
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome, {displayName}</h1>
      <p className="text-muted-foreground">Your orgs and teams will appear here.</p>
    </>
  );
}

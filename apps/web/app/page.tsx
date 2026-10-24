import { HealthResponse } from '@overtime/shared';
import { Button } from '@overtime/ui';
import { serverApi } from '../lib/api-server';

export const dynamic = 'force-dynamic';

async function getHealth() {
  try {
    const api = await serverApi();
    const res = await api.api.health.$get();
    if (!res.ok) return null;
    return HealthResponse.parse(await res.json());
  } catch {
    return null;
  }
}

export default async function Home() {
  const health = await getHealth();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Overtime</h1>
      <p className="text-muted-foreground">
        Swiss-format CS2 tournaments for community organizers: verified FACEIT rosters, automatic
        pairings and live standings.
      </p>
      <div>
        <Button disabled>Tournaments coming soon</Button>
      </div>
      <p className="text-sm text-muted-foreground">
        API: {health ? `${health.status} · ${health.version}` : 'unreachable'}
      </p>
    </main>
  );
}

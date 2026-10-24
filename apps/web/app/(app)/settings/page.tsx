import { CONNECT_ERRORS, type ConnectError } from '@overtime/ui';
import { Settings } from './settings';

function connectError(value: unknown): ConnectError | undefined {
  return typeof value === 'string' && value in CONNECT_ERRORS ? (value as ConnectError) : undefined;
}

export default async function SettingsPage({ searchParams }: PageProps<'/settings'>) {
  const { error, connected } = await searchParams;
  return <Settings initialError={connectError(error)} justConnected={connected === 'faceit'} />;
}

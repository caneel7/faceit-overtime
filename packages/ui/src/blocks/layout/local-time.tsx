'use client';

import { useSyncExternalStore } from 'react';

type LocalTimeProps = { iso: string; className?: string } & (
  { format: 'date' | 'datetime' } | { format: 'relative'; now: string }
);

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const subscribe = () => () => {};

function useIsBrowser() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function relativeTime(iso: string, now: string): string {
  const diff = Date.parse(iso) - Date.parse(now);
  const abs = Math.abs(diff);
  let text: string;
  if (abs >= DAY) {
    const days = Math.floor(abs / DAY);
    const hours = Math.floor((abs % DAY) / HOUR);
    text = hours ? `${days} d ${hours} h` : `${days} d`;
  } else if (abs >= HOUR) {
    const hours = Math.floor(abs / HOUR);
    const minutes = Math.floor((abs % HOUR) / MINUTE);
    text = minutes ? `${hours} h ${minutes} min` : `${hours} h`;
  } else if (abs >= MINUTE) {
    text = `${Math.floor(abs / MINUTE)} min`;
  } else {
    return 'now';
  }
  return diff > 0 ? `in ${text}` : `${text} ago`;
}

function absoluteTime(iso: string, format: 'date' | 'datetime', timeZone?: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: format === 'datetime' ? 'short' : undefined,
    timeZone,
  }).format(new Date(iso));
}

export function LocalTime(props: LocalTimeProps) {
  const { iso, className } = props;
  const isBrowser = useIsBrowser();

  if (props.format === 'relative') {
    return (
      <time dateTime={iso} className={className} title={absoluteTime(iso, 'datetime', 'UTC')}>
        {relativeTime(iso, props.now)}
      </time>
    );
  }

  const { format } = props;
  const text = isBrowser
    ? absoluteTime(iso, format)
    : `${absoluteTime(iso, format, 'UTC')}${format === 'datetime' ? ' UTC' : ''}`;

  return (
    <time dateTime={iso} className={className}>
      {text}
    </time>
  );
}

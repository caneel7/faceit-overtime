export const MOCK_NOW = '2026-10-25T18:00:00.000Z';

const HOUR = 60 * 60 * 1000;

export function hoursFromNow(hours: number): string {
  return new Date(Date.parse(MOCK_NOW) + hours * HOUR).toISOString();
}

export function daysFromNow(days: number): string {
  return hoursFromNow(days * 24);
}

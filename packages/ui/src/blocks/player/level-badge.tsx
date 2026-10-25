import { cn } from '../../lib/utils';

type LevelBadgeProps = { level: number | null; className?: string };

function levelColour(level: number) {
  if (level === 1) return 'border-zinc-400/50 text-zinc-200';
  if (level <= 3) return 'border-emerald-400/50 text-emerald-300';
  if (level <= 7) return 'border-yellow-400/50 text-yellow-300';
  if (level <= 9) return 'border-orange-400/50 text-orange-300';
  return 'border-red-400/60 text-red-300';
}

export function LevelBadge({ level, className }: LevelBadgeProps) {
  if (level === null) {
    return (
      <span
        className={cn(
          'inline-flex w-fit items-center rounded-md border border-dashed px-2 py-0.5 text-xs text-muted-foreground',
          className,
        )}
      >
        No CS2 level
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums',
        levelColour(level),
        className,
      )}
    >
      <span aria-hidden>Lvl {level}</span>
      <span className="sr-only">FACEIT level {level}</span>
    </span>
  );
}

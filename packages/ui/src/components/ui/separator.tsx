import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

function Separator({ className, label, ...props }: ComponentProps<'div'> & { label?: string }) {
  if (!label) {
    return (
      <div
        role="separator"
        data-slot="separator"
        className={cn('h-px w-full bg-border', className)}
        {...props}
      />
    );
  }
  return (
    <div
      role="separator"
      aria-label={label}
      data-slot="separator"
      className={cn('flex items-center gap-3 text-xs text-muted-foreground uppercase', className)}
      {...props}
    >
      <span className="h-px flex-1 bg-border" />
      <span aria-hidden="true">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export { Separator };

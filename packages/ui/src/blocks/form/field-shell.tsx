import type { ReactNode } from 'react';
import { Label } from '../../primitives/label';

type FieldShellProps = {
  id: string;
  label: string;
  error?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
};

export function FieldShell({ id, label, error, hint, children }: FieldShellProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function describedBy(id: string, error?: ReactNode, hint?: ReactNode) {
  const ids = [hint && !error ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length ? ids.join(' ') : undefined;
}

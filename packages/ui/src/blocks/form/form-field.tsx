import type { ComponentProps, ReactNode } from 'react';
import { Input } from '../../primitives/input';
import { Label } from '../../primitives/label';

type FormFieldProps = ComponentProps<'input'> & {
  id: string;
  label: string;
  error?: ReactNode;
  hint?: ReactNode;
};

export function FormField({ id, label, error, hint, ...inputProps }: FormFieldProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ');
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...inputProps}
      />
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

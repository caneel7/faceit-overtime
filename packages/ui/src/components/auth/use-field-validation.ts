import type { z } from '@overtime/shared';
import { useState, type ChangeEvent, type FocusEvent } from 'react';
import type { FieldErrors } from './field-errors';

export type FieldRules<K extends string> = Partial<
  Record<K, { schema: z.ZodType<string>; message: string }>
>;

export function useFieldValidation<K extends string>(rules: FieldRules<K>) {
  const [errors, setErrors] = useState<FieldErrors<K>>({});

  function validate(name: K, value: string): string | null {
    const rule = rules[name];
    if (!rule) {
      setErrors((current) => ({ ...current, [name]: undefined }));
      return value;
    }
    const parsed = rule.schema.safeParse(value);
    setErrors((current) => ({ ...current, [name]: parsed.success ? undefined : rule.message }));
    return parsed.success ? parsed.data : null;
  }

  function field(name: K, onValidBlur?: (value: string) => void) {
    return {
      onBlur: (event: FocusEvent<HTMLInputElement>) => {
        const { value } = event.currentTarget;
        if (!value) return;
        const parsed = validate(name, value);
        if (parsed !== null) onValidBlur?.(parsed);
      },
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        if (errors[name]) validate(name, event.currentTarget.value);
      },
    };
  }

  return { errors, setErrors, field };
}

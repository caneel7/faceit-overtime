'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { REGIONS } from '../../models/player';
import { Alert, AlertDescription, AlertTitle } from '../../primitives/alert';
import { Button } from '../../primitives/button';
import { Checkbox } from '../../primitives/checkbox';
import { Label } from '../../primitives/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../primitives/select';
import { Textarea } from '../../primitives/textarea';
import { describedBy, FieldShell } from '../form/field-shell';
import { FormField } from '../form/form-field';
import { EVENT_FIELD_MESSAGES, EVENT_FORM_DEFAULTS, EventFormValues } from './event-form.schema';

type Option = { value: number | null; label: string };

const DESCRIPTION_HINT = 'Shown on the event page. Map pool, check-in, how to report results.';

const LEVEL_OPTIONS: Option[] = [
  { value: null, label: 'Any' },
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({ value: n, label: `Level ${n}` })),
];
const BEST_OF_OPTIONS: Option[] = [1, 3, 5].map((n) => ({ value: n, label: `Best of ${n}` }));
const SUB_OPTIONS: Option[] = [
  { value: 0, label: 'No subs' },
  { value: 1, label: '1 sub' },
];

function encode(value: number | null) {
  return value === null ? 'any' : String(value);
}

function decode(value: string) {
  return value === 'any' ? null : Number(value);
}

type NumberSelectProps = {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  onBlur: () => void;
  options: Option[];
  error?: ReactNode;
  disabled?: boolean;
};

function NumberSelect({
  id,
  label,
  value,
  onChange,
  onBlur,
  options,
  error,
  disabled,
}: NumberSelectProps) {
  return (
    <FieldShell id={id} label={label} error={error}>
      <Select value={encode(value)} onValueChange={(v) => onChange(decode(v))} disabled={disabled}>
        <SelectTrigger
          id={id}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error)}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={encode(option.value)} value={encode(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="grid gap-4 rounded-lg border p-4">
      <legend className="px-1 text-sm font-semibold">{title}</legend>
      {description ? <p className="-mt-2 text-xs text-muted-foreground">{description}</p> : null}
      {children}
    </fieldset>
  );
}

type EventFormProps = {
  mode: 'create' | 'edit';
  defaultValues?: EventFormValues;
  onSubmit: (values: EventFormValues) => void;
  cancelHref: string;
  pending?: boolean;
  error?: 'locked';
};

export function EventForm({
  mode,
  defaultValues = EVENT_FORM_DEFAULTS,
  onSubmit,
  cancelHref,
  pending = false,
  error,
}: EventFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(EventFormValues),
    mode: 'onTouched',
    defaultValues,
  });

  const message = (field: keyof typeof EVENT_FIELD_MESSAGES) =>
    errors[field] ? EVENT_FIELD_MESSAGES[field] : undefined;

  return (
    <form className="grid gap-6" onSubmit={handleSubmit((values) => onSubmit(values))} noValidate>
      {error === 'locked' ? (
        <Alert variant="destructive">
          <AlertTitle>This event can't be edited any more</AlertTitle>
          <AlertDescription>
            Registration has opened. To change it, cancel the event and create a new one.
          </AlertDescription>
        </Alert>
      ) : null}

      <Section title="Basics">
        <FormField
          id="event-name"
          label="Name"
          placeholder="Autumn Cup #3"
          {...register('name')}
          error={message('name')}
          disabled={pending}
        />
        <FieldShell
          id="event-description"
          label="Description and rules"
          hint={DESCRIPTION_HINT}
          error={message('description')}
        >
          <Textarea
            id="event-description"
            rows={5}
            {...register('description')}
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={describedBy(
              'event-description',
              message('description'),
              DESCRIPTION_HINT,
            )}
            disabled={pending}
          />
        </FieldShell>
      </Section>

      <Section title="Format" description="CS2, 5v5. Teams have 5 players.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="maxSubs"
            render={({ field }) => (
              <NumberSelect
                id="event-max-subs"
                label="Substitutes"
                value={field.value}
                onChange={(v) => field.onChange(v ?? 0)}
                onBlur={field.onBlur}
                options={SUB_OPTIONS}
                disabled={pending}
              />
            )}
          />
          <FormField
            id="event-max-teams"
            type="number"
            inputMode="numeric"
            label="Max teams"
            hint="Even number, 4 to 64."
            {...register('maxTeams', { valueAsNumber: true })}
            error={message('maxTeams')}
            disabled={pending}
          />
        </div>
      </Section>

      <Section title="Eligibility" description="Checked against each player's FACEIT profile.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="minLevel"
            render={({ field }) => (
              <NumberSelect
                id="event-min-level"
                label="Minimum FACEIT level"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={LEVEL_OPTIONS}
                disabled={pending}
              />
            )}
          />
          <Controller
            control={control}
            name="maxLevel"
            render={({ field }) => (
              <NumberSelect
                id="event-max-level"
                label="Maximum FACEIT level"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={LEVEL_OPTIONS}
                error={message('maxLevel')}
                disabled={pending}
              />
            )}
          />
        </div>
        <Controller
          control={control}
          name="regions"
          render={({ field }) => (
            <fieldset className="grid gap-2">
              <legend className="mb-2 text-sm font-medium">Regions</legend>
              <div className="flex flex-wrap gap-x-5 gap-y-3">
                {REGIONS.map((region) => {
                  const id = `event-region-${region}`;
                  return (
                    <div key={region} className="flex items-center gap-2">
                      <Checkbox
                        id={id}
                        checked={field.value.includes(region)}
                        onCheckedChange={(checked) =>
                          field.onChange(
                            checked
                              ? [...field.value, region]
                              : field.value.filter((r) => r !== region),
                          )
                        }
                        onBlur={field.onBlur}
                        disabled={pending}
                      />
                      <Label htmlFor={id}>{region}</Label>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Leave all unticked to allow any region.
              </p>
            </fieldset>
          )}
        />
      </Section>

      <Section title="Registration" description="Times are in your time zone.">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="event-opens"
            type="datetime-local"
            label="Opens"
            {...register('registrationOpensAt')}
            disabled={pending}
          />
          <FormField
            id="event-closes"
            type="datetime-local"
            label="Closes"
            {...register('registrationClosesAt')}
            error={message('registrationClosesAt')}
            disabled={pending}
          />
        </div>
      </Section>

      <Section title="Swiss stage">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="event-wins"
            type="number"
            inputMode="numeric"
            label="Wins to advance"
            {...register('winsToAdvance', { valueAsNumber: true })}
            error={message('winsToAdvance')}
            disabled={pending}
          />
          <FormField
            id="event-losses"
            type="number"
            inputMode="numeric"
            label="Losses to be eliminated"
            {...register('lossesToEliminate', { valueAsNumber: true })}
            error={message('lossesToEliminate')}
            disabled={pending}
          />
          <Controller
            control={control}
            name="bestOf"
            render={({ field }) => (
              <NumberSelect
                id="event-best-of"
                label="Regular matches"
                value={field.value}
                onChange={(v) => field.onChange(v ?? 1)}
                onBlur={field.onBlur}
                options={BEST_OF_OPTIONS}
                disabled={pending}
              />
            )}
          />
          <Controller
            control={control}
            name="deciderBestOf"
            render={({ field }) => (
              <NumberSelect
                id="event-decider-best-of"
                label="Advancement and elimination matches"
                value={field.value}
                onChange={(v) => field.onChange(v ?? 3)}
                onBlur={field.onBlur}
                options={BEST_OF_OPTIONS}
                disabled={pending}
              />
            )}
          />
        </div>
      </Section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button asChild variant="ghost">
          <a href={cancelHref}>Cancel</a>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : mode === 'create' ? 'Create draft' : 'Save draft'}
        </Button>
      </div>
    </form>
  );
}

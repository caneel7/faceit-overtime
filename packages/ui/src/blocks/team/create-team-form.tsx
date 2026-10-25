'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '../../primitives/button';
import { Label } from '../../primitives/label';
import { RadioGroup, RadioGroupItem } from '../../primitives/radio-group';
import { FormField } from '../form/form-field';
import { CreateTeamFormValues, TEAM_FIELD_MESSAGES } from './create-team-form.schema';

type CreateTeamFormProps = {
  faceitConnected: boolean;
  connectFaceitHref: string;
  onSubmit: (values: CreateTeamFormValues) => void;
  pending?: boolean;
};

export function CreateTeamForm({
  faceitConnected,
  connectFaceitHref,
  onSubmit,
  pending = false,
}: CreateTeamFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTeamFormValues>({
    resolver: zodResolver(CreateTeamFormValues),
    mode: 'onTouched',
    defaultValues: { name: '', tag: '', role: faceitConnected ? 'player' : 'coach' },
  });

  return (
    <form className="grid gap-5" noValidate onSubmit={handleSubmit((values) => onSubmit(values))}>
      <FormField
        id="team-name"
        label="Team name"
        placeholder="Night Shift"
        {...register('name')}
        error={errors.name ? TEAM_FIELD_MESSAGES.name : undefined}
        disabled={pending}
      />
      <FormField
        id="team-tag"
        label="Tag"
        placeholder="NSH"
        hint="Up to 5 characters, shown next to the name."
        autoCapitalize="characters"
        {...register('tag')}
        error={errors.tag ? TEAM_FIELD_MESSAGES.tag : undefined}
        disabled={pending}
      />
      <Controller
        control={control}
        name="role"
        render={({ field }) => (
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">You're joining as</legend>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="grid gap-3"
              disabled={pending}
            >
              <div className="flex items-start gap-2">
                <RadioGroupItem
                  value="player"
                  id="team-role-player"
                  disabled={!faceitConnected}
                  aria-describedby="team-role-player-hint"
                  className="mt-0.5"
                />
                <div className="grid gap-0.5">
                  <Label htmlFor="team-role-player">Player</Label>
                  <p id="team-role-player-hint" className="text-xs text-muted-foreground">
                    {faceitConnected ? (
                      'You play and count towards eligibility.'
                    ) : (
                      <>
                        Needs FACEIT.{' '}
                        <a
                          href={connectFaceitHref}
                          className="text-primary underline underline-offset-4"
                        >
                          Connect FACEIT
                        </a>{' '}
                        to join as a player.
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <RadioGroupItem
                  value="coach"
                  id="team-role-coach"
                  aria-describedby="team-role-coach-hint"
                  className="mt-0.5"
                />
                <div className="grid gap-0.5">
                  <Label htmlFor="team-role-coach">Coach</Label>
                  <p id="team-role-coach-hint" className="text-xs text-muted-foreground">
                    You manage the team but don't play. No FACEIT needed.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </fieldset>
        )}
      />
      <p className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
        A team has up to 6 players (5 + 1 sub) and 1 coach. You'll be the captain and can invite the
        rest from the team page.
      </p>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Creating…' : 'Create team'}
      </Button>
    </form>
  );
}

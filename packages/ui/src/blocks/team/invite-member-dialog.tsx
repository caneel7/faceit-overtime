'use client';

import { useState } from 'react';
import type { InviteCandidate, TeamRole } from '../../models/team';
import { Alert, AlertDescription } from '../../primitives/alert';
import { Button } from '../../primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../primitives/dialog';
import { Input } from '../../primitives/input';
import { Label } from '../../primitives/label';
import { RadioGroup, RadioGroupItem } from '../../primitives/radio-group';
import { PlayerIdentity } from '../player/player-identity';
import type { SlotsLeft } from './team-slots';

export type InviteMemberError = 'team_full' | 'already_member' | 'already_invited';

const ERRORS: Record<InviteMemberError, string> = {
  team_full: 'The team has no free slot for that role.',
  already_member: "They're already on this team.",
  already_invited: 'They already have a pending invite to this team.',
};

type InviteMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamName: string;
  slots: SlotsLeft;
  onSearch: (query: string) => void;
  results: InviteCandidate[] | null;
  searching?: boolean;
  onInvite: (invite: { userId: string; role: TeamRole }) => void;
  pending?: boolean;
  error?: InviteMemberError;
};

function InviteMemberBody({
  teamName,
  slots,
  onSearch,
  results,
  searching = false,
  onInvite,
  pending = false,
  error,
}: Omit<InviteMemberDialogProps, 'open' | 'onOpenChange'>) {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<TeamRole>(slots.players > 0 ? 'player' : 'coach');
  const canSearch = query.trim().length >= 2;

  return (
    <div className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Invite to {teamName}</DialogTitle>
        <DialogDescription>
          Invite someone who already has an Overtime account. They join once they accept.
        </DialogDescription>
      </DialogHeader>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{ERRORS[error]}</AlertDescription>
        </Alert>
      ) : null}

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">Invite as</legend>
        <RadioGroup
          value={role}
          onValueChange={(value) => setRole(value as TeamRole)}
          className="flex flex-wrap gap-5"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="player" id="invite-role-player" disabled={slots.players === 0} />
            <Label htmlFor="invite-role-player">
              Player <span className="text-muted-foreground">({slots.players} left)</span>
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="coach" id="invite-role-coach" disabled={slots.coaches === 0} />
            <Label htmlFor="invite-role-coach">
              Coach <span className="text-muted-foreground">({slots.coaches} left)</span>
            </Label>
          </div>
        </RadioGroup>
      </fieldset>

      <form
        className="grid gap-2"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSearch) onSearch(query.trim());
        }}
      >
        <Label htmlFor="invite-search">FACEIT nickname or email</Label>
        <div className="flex gap-2">
          <Input
            id="invite-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
          <Button type="submit" variant="outline" disabled={!canSearch || searching}>
            {searching ? 'Searching…' : 'Search'}
          </Button>
        </div>
      </form>

      <div aria-live="polite">
        {results === null ? null : results.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No one found. They need an Overtime account before you can invite them.
          </p>
        ) : (
          <ul className="divide-y rounded-md border">
            {results.map((candidate) => {
              const needsFaceit = role === 'player' && candidate.player === null;
              return (
                <li
                  key={candidate.userId}
                  className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
                >
                  {candidate.player ? (
                    <PlayerIdentity
                      nickname={candidate.player.nickname}
                      avatarUrl={candidate.player.avatarUrl}
                      cs2Level={candidate.player.cs2Level}
                      size="sm"
                    />
                  ) : (
                    <span className="grid text-sm">
                      <span className="font-medium">{candidate.displayName}</span>
                      <span className="text-xs text-muted-foreground">No FACEIT connected</span>
                    </span>
                  )}
                  <Button
                    size="sm"
                    disabled={pending || needsFaceit}
                    onClick={() => onInvite({ userId: candidate.userId, role })}
                    aria-label={`Invite ${candidate.displayName} as ${role}`}
                  >
                    {needsFaceit ? 'Needs FACEIT to play' : `Invite as ${role}`}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export function InviteMemberDialog({ open, onOpenChange, ...body }: InviteMemberDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>{open ? <InviteMemberBody {...body} /> : null}</DialogContent>
    </Dialog>
  );
}

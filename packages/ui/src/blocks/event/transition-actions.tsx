'use client';

import { useState } from 'react';
import type { EventStatus } from '../../models/event';
import { Alert, AlertDescription, AlertTitle } from '../../primitives/alert';
import { Button } from '../../primitives/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../primitives/dialog';

export type TransitionTarget = 'registration_open' | 'registration_closed' | 'cancelled';

const COPY: Record<
  TransitionTarget,
  { title: string; description: string; confirm: string; keep: string }
> = {
  registration_open: {
    title: 'Open registration?',
    description:
      "Teams can register as soon as it opens. After this the event can't be edited: to change anything you'd cancel it and create a new one.",
    confirm: 'Open registration',
    keep: 'Keep as draft',
  },
  registration_closed: {
    title: 'Close registration?',
    description: 'No more teams can register. Teams that already registered stay in.',
    confirm: 'Close registration',
    keep: 'Keep open',
  },
  cancelled: {
    title: 'Cancel this event?',
    description:
      "It stays visible as cancelled and registered teams can see that. This can't be undone.",
    confirm: 'Cancel event',
    keep: 'Keep event',
  },
};

type TransitionConfirmDialogProps = {
  to: TransitionTarget | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (to: TransitionTarget) => void;
};

export function TransitionConfirmDialog({
  to,
  onOpenChange,
  onConfirm,
}: TransitionConfirmDialogProps) {
  const copy = to ? COPY[to] : null;
  return (
    <Dialog open={to !== null} onOpenChange={onOpenChange}>
      {to && copy ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.title}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{copy.keep}</Button>
            </DialogClose>
            <Button
              variant={to === 'cancelled' ? 'destructive' : 'default'}
              onClick={() => onConfirm(to)}
            >
              {copy.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

type TransitionActionsProps = {
  status: EventStatus;
  onTransition: (to: TransitionTarget) => void;
  pending?: boolean;
  error?: 'invalid_transition';
};

export function TransitionActions({
  status,
  onTransition,
  pending = false,
  error,
}: TransitionActionsProps) {
  const [confirming, setConfirming] = useState<TransitionTarget | null>(null);
  const terminal = status === 'completed' || status === 'cancelled';

  function confirm(to: TransitionTarget) {
    setConfirming(null);
    onTransition(to);
  }

  return (
    <div className="grid gap-3">
      {error === 'invalid_transition' ? (
        <Alert variant="destructive">
          <AlertTitle>That change isn't allowed any more</AlertTitle>
          <AlertDescription>Reload the page to see the event's current status.</AlertDescription>
        </Alert>
      ) : null}

      {terminal ? (
        <p className="text-sm text-muted-foreground">
          {status === 'completed' ? 'This event is finished.' : 'This event was cancelled.'}
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {status === 'draft' ? (
            <Button disabled={pending} onClick={() => setConfirming('registration_open')}>
              {pending ? 'Saving…' : 'Open registration'}
            </Button>
          ) : null}
          {status === 'registration_open' ? (
            <Button disabled={pending} onClick={() => setConfirming('registration_closed')}>
              {pending ? 'Saving…' : 'Close registration'}
            </Button>
          ) : null}
          {status === 'registration_closed' ? (
            <>
              <Button disabled aria-describedby="start-hint">
                Start event
              </Button>
              <span id="start-hint" className="text-xs text-muted-foreground">
                Starting and round 1 come with the rounds step.
              </span>
            </>
          ) : null}
          {status === 'in_progress' ? (
            <span className="text-sm text-muted-foreground">
              Running. Rounds and results are managed from the matches page.
            </span>
          ) : null}
          <Button
            variant="outline"
            className="text-red-300 hover:text-red-200"
            disabled={pending}
            onClick={() => setConfirming('cancelled')}
          >
            Cancel event
          </Button>
        </div>
      )}

      <TransitionConfirmDialog
        to={confirming}
        onOpenChange={(open) => {
          if (!open) setConfirming(null);
        }}
        onConfirm={confirm}
      />
    </div>
  );
}

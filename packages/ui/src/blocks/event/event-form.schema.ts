import { z } from '@overtime/shared';
import { REGIONS } from '../../models/player';

const Level = z.number().int().min(1).max(10).nullable();
const BestOf = z.union([z.literal(1), z.literal(3), z.literal(5)]);

export const EventFormValues = z
  .object({
    name: z.string().trim().min(1).max(80),
    description: z.string().trim().max(5000),
    maxSubs: z.union([z.literal(0), z.literal(1)]),
    maxTeams: z
      .number()
      .int()
      .min(4)
      .max(64)
      .refine((n) => n % 2 === 0),
    minLevel: Level,
    maxLevel: Level,
    regions: z.array(z.enum(REGIONS)),
    registrationOpensAt: z.string(),
    registrationClosesAt: z.string(),
    winsToAdvance: z.number().int().min(1).max(5),
    lossesToEliminate: z.number().int().min(1).max(5),
    bestOf: BestOf,
    deciderBestOf: BestOf,
  })
  .superRefine((values, ctx) => {
    if (values.minLevel !== null && values.maxLevel !== null && values.minLevel > values.maxLevel) {
      ctx.addIssue({ code: 'custom', path: ['maxLevel'], message: 'level_order' });
    }
    if (
      values.registrationOpensAt &&
      values.registrationClosesAt &&
      values.registrationClosesAt <= values.registrationOpensAt
    ) {
      ctx.addIssue({ code: 'custom', path: ['registrationClosesAt'], message: 'window_order' });
    }
  });
export type EventFormValues = z.infer<typeof EventFormValues>;

export const EVENT_FORM_DEFAULTS: EventFormValues = {
  name: '',
  description: '',
  maxSubs: 1,
  maxTeams: 16,
  minLevel: null,
  maxLevel: null,
  regions: [],
  registrationOpensAt: '',
  registrationClosesAt: '',
  winsToAdvance: 3,
  lossesToEliminate: 3,
  bestOf: 1,
  deciderBestOf: 3,
};

export const EVENT_FIELD_MESSAGES = {
  name: 'Use 1 to 80 characters.',
  description: 'Keep it under 5,000 characters.',
  maxTeams: 'Use an even number from 4 to 64.',
  maxLevel: 'The maximum level must be at least the minimum.',
  registrationClosesAt: 'Registration has to close after it opens.',
  winsToAdvance: 'Use a number from 1 to 5.',
  lossesToEliminate: 'Use a number from 1 to 5.',
} as const;

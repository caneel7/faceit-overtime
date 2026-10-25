import type { Meta, StoryObj } from '@storybook/react-vite';
import { mobileGlobals } from '../../mocks/header';
import { LIVE_EVENTS } from '../../mocks/matches';
import { MatchRow } from '../match/match-row';
import { LiveEventCard } from './live-event-card';

const meta = {
  title: 'Blocks/Event/LiveEventCard',
  component: LiveEventCard,
  args: { live: LIVE_EVENTS[0]!, href: `/event/${LIVE_EVENTS[0]!.event.id}` },
  decorators: [
    (Story) => (
      <div className="w-[32rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LiveEventCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MidRound: Story = {};
export const RoundOne: Story = { args: { live: LIVE_EVENTS[1]! } };
export const AllMatches: Story = { args: { maxMatches: 10 } };
export const Mobile: Story = { globals: mobileGlobals };

export const MatchRows: Story = {
  render: () => (
    <ul className="w-[32rem] max-w-full divide-y">
      {LIVE_EVENTS[0]!.matches.map((match) => (
        <li key={match.id}>
          <MatchRow match={match} />
        </li>
      ))}
    </ul>
  ),
};

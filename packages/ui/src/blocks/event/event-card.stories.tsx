import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  almostFullEvent,
  anyoneEvent,
  cancelledEvent,
  closedEvent,
  draftEvent,
  finishedEvent,
  fullEvent,
  liveEvent,
  openEvent,
} from '../../mocks/events';
import { mobileGlobals } from '../../mocks/header';
import { MOCK_NOW } from '../../mocks/time';
import { EventCard } from './event-card';

const meta = {
  title: 'Blocks/Event/EventCard',
  component: EventCard,
  args: { event: openEvent, href: `/event/${openEvent.slug}`, now: MOCK_NOW },
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EventCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};
export const AlmostFull: Story = { args: { event: almostFullEvent } };
export const Full: Story = { args: { event: fullEvent } };
export const AnyoneCanEnter: Story = { args: { event: anyoneEvent } };
export const RegistrationClosed: Story = { args: { event: closedEvent } };
export const Live: Story = { args: { event: liveEvent } };
export const Finished: Story = { args: { event: finishedEvent } };
export const Cancelled: Story = { args: { event: cancelledEvent } };
export const Draft: Story = { args: { event: draftEvent } };
export const Mobile: Story = { globals: mobileGlobals };

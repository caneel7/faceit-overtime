import type { Meta, StoryObj } from '@storybook/react-vite';
import { EVENT_STATUSES } from '../../models/event';
import { EventStatusBadge } from './event-status-badge';

const meta = {
  title: 'Blocks/Event/EventStatusBadge',
  component: EventStatusBadge,
  args: { status: 'registration_open' },
} satisfies Meta<typeof EventStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {EVENT_STATUSES.map((status) => (
        <EventStatusBadge key={status} status={status} />
      ))}
    </div>
  ),
};

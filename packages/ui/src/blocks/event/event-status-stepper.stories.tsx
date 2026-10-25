import type { Meta, StoryObj } from '@storybook/react-vite';
import { EVENT_STATUSES } from '../../models/event';
import { EventStatusStepper } from './event-status-stepper';
import { STATUS_LABEL } from './format';

const meta = {
  title: 'Blocks/Event/EventStatusStepper',
  component: EventStatusStepper,
  parameters: { layout: 'padded' },
  args: { status: 'registration_open' },
} satisfies Meta<typeof EventStatusStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RegistrationOpen: Story = {};

export const EveryStatus: Story = {
  render: () => (
    <div className="grid gap-6">
      {EVENT_STATUSES.map((status) => (
        <section key={status} className="grid gap-2">
          <h2 className="text-xs text-muted-foreground">{STATUS_LABEL[status]}</h2>
          <EventStatusStepper status={status} />
        </section>
      ))}
    </div>
  ),
};

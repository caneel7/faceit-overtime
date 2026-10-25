import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { mobileGlobals } from '../../mocks/header';
import { EventFilters, NO_FILTERS, type EventFilterValue } from './event-filters';

function Stateful({ initial }: { initial: EventFilterValue }) {
  const [value, setValue] = useState(initial);
  return (
    <div className="grid gap-4">
      <EventFilters value={value} onChange={setValue} />
      <pre className="text-xs text-muted-foreground">{JSON.stringify(value)}</pre>
    </div>
  );
}

const meta = {
  title: 'Blocks/Event/EventFilters',
  component: EventFilters,
  parameters: { layout: 'padded' },
  args: { value: NO_FILTERS, onChange: fn() },
} satisfies Meta<typeof EventFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <Stateful initial={NO_FILTERS} /> };

export const Active: Story = {
  render: () => <Stateful initial={{ status: 'open', region: 'EU', level: 7 }} />,
};

export const Mobile: Story = {
  globals: mobileGlobals,
  render: () => <Stateful initial={{ status: 'open', region: 'EU', level: 7 }} />,
};

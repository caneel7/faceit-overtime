import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { NO_FILTERS, type EventFilterValue } from '../../blocks/event/event-filters';
import { filterEvents, PUBLIC_EVENTS } from '../../mocks/events';
import { mobileGlobals, mockHeader, pageParameters } from '../../mocks/header';
import { MOCK_NOW } from '../../mocks/time';
import { EventsPage } from './events-page';

function Interactive({ initial = NO_FILTERS }: { initial?: EventFilterValue }) {
  const [filters, setFilters] = useState(initial);
  return (
    <EventsPage
      header={mockHeader({ active: 'events' })}
      events={filterEvents(PUBLIC_EVENTS, filters)}
      filters={filters}
      onFiltersChange={setFilters}
      eventHref={(slug) => `/event/${slug}`}
      now={MOCK_NOW}
    />
  );
}

const meta = {
  title: 'Pages/Event/EventsPage',
  component: EventsPage,
  parameters: pageParameters,
  args: {
    header: mockHeader({ active: 'events' }),
    events: PUBLIC_EVENTS,
    filters: NO_FILTERS,
    onFiltersChange: fn(),
    eventHref: (slug: string) => `/event/${slug}`,
    now: MOCK_NOW,
  },
} satisfies Meta<typeof EventsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <Interactive /> };

export const OpenInEuAtLevel7: Story = {
  render: () => <Interactive initial={{ status: 'open', region: 'EU', level: 7 }} />,
};

export const LiveOnly: Story = {
  render: () => <Interactive initial={{ status: 'live', region: null, level: null }} />,
};

export const NoMatches: Story = {
  render: () => <Interactive initial={{ status: 'live', region: 'SEA', level: 2 }} />,
};

export const SignedOut: Story = {
  args: { header: mockHeader({ active: 'events', signedIn: false }) },
};
export const Empty: Story = { args: { events: [] } };
export const Loading: Story = { args: { loading: true } };
export const LoadFailed: Story = { args: { error: true, onRetry: fn() } };
export const Mobile: Story = { globals: mobileGlobals, render: () => <Interactive /> };

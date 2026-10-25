import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { PUBLIC_EVENTS } from '../../mocks/events';
import { MOCK_NOW } from '../../mocks/time';
import { Button } from '../../primitives/button';
import { EventList } from './event-list';

const meta = {
  title: 'Blocks/Event/EventList',
  component: EventList,
  parameters: { layout: 'padded' },
  args: { events: PUBLIC_EVENTS, hrefFor: (id: string) => `/event/${id}`, now: MOCK_NOW },
} satisfies Meta<typeof EventList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { args: { loading: true } };
export const LoadFailed: Story = { args: { error: true, onRetry: fn() } };
export const Empty: Story = {
  args: {
    events: [],
    emptyTitle: 'No events yet',
    emptyDescription: 'Create your first event. It starts as a draft only your admins can see.',
    emptyAction: <Button size="sm">Create event</Button>,
  },
};

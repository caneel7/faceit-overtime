import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  cancelledEvent,
  draftEvent,
  finishedEvent,
  liveEvent,
  openEvent,
} from '../../mocks/events';
import { Button } from '../../primitives/button';
import { EventHeader } from './event-header';

const meta = {
  title: 'Blocks/Event/EventHeader',
  component: EventHeader,
  parameters: { layout: 'padded' },
  args: { event: openEvent, orgHref: '/o/uni-esports-club' },
} satisfies Meta<typeof EventHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};
export const Live: Story = { args: { event: liveEvent } };
export const Finished: Story = { args: { event: finishedEvent } };
export const Cancelled: Story = { args: { event: cancelledEvent } };
export const DraftPreview: Story = { args: { event: draftEvent } };
export const WithActions: Story = {
  args: { actions: <Button variant="outline">Manage event</Button> },
};

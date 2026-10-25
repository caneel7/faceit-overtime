import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import {
  cancelledEvent,
  closedEvent,
  draftEvent,
  finishedEvent,
  liveEvent,
  openEvent,
} from '../../mocks/events';
import { mobileGlobals, mockHeader, pageParameters } from '../../mocks/header';
import { EventAdminPage } from './event-admin-page';

const meta = {
  title: 'Pages/Event/EventAdminPage',
  component: EventAdminPage,
  parameters: pageParameters,
  args: {
    header: mockHeader(),
    event: draftEvent,
    orgManageHref: '/o/uni-esports-club/manage',
    publicHref: `/event/${draftEvent.id}`,
    editHref: `/event/${draftEvent.id}/edit`,
    onTransition: fn(),
  },
} satisfies Meta<typeof EventAdminPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Draft: Story = {};
export const RegistrationOpen: Story = { args: { event: openEvent } };
export const RegistrationClosed: Story = { args: { event: closedEvent } };
export const Live: Story = { args: { event: liveEvent } };
export const Finished: Story = { args: { event: finishedEvent } };
export const Cancelled: Story = { args: { event: cancelledEvent } };
export const InvalidTransition: Story = {
  args: { event: openEvent, error: 'invalid_transition' },
};
export const Mobile: Story = { globals: mobileGlobals };

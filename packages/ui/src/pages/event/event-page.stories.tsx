import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  anyoneEvent,
  cancelledEvent,
  closedEvent,
  draftEvent,
  finishedEvent,
  fullEvent,
  liveEvent,
  openEvent,
} from '../../mocks/events';
import { mobileGlobals, mockHeader, pageParameters } from '../../mocks/header';
import { MOCK_NOW } from '../../mocks/time';
import { EventPage } from './event-page';

const meta = {
  title: 'Pages/Event/EventPage',
  component: EventPage,
  parameters: pageParameters,
  args: {
    header: mockHeader({ active: 'events', signedIn: false }),
    event: openEvent,
    viewer: 'public',
    now: MOCK_NOW,
    orgHref: '/o/uni-esports-club',
    manageHref: `/event/${openEvent.id}/manage`,
    registerHref: `/event/${openEvent.id}/register`,
  },
} satisfies Meta<typeof EventPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RegistrationOpen: Story = {};
export const AnyoneCanEnter: Story = { args: { event: anyoneEvent } };
export const Full: Story = { args: { event: fullEvent } };
export const RegistrationClosed: Story = { args: { event: closedEvent } };
export const Live: Story = { args: { event: liveEvent } };
export const Finished: Story = { args: { event: finishedEvent } };
export const Cancelled: Story = { args: { event: cancelledEvent } };
export const AdminView: Story = {
  args: { viewer: 'admin', header: mockHeader({ active: 'events' }) },
};
export const DraftAdminPreview: Story = {
  args: { event: draftEvent, viewer: 'admin', header: mockHeader({ active: 'events' }) },
};
export const Mobile: Story = { globals: mobileGlobals };

import type { Meta, StoryObj } from '@storybook/react-vite';
import { ORG_EVENTS } from '../../mocks/events';
import { mobileGlobals, mockHeader, pageParameters } from '../../mocks/header';
import { uniEsportsClub } from '../../mocks/orgs';
import { MOCK_NOW } from '../../mocks/time';
import { OrgPublicPage } from './org-public-page';

const meta = {
  title: 'Pages/Org/OrgPublicPage',
  component: OrgPublicPage,
  parameters: pageParameters,
  args: {
    header: mockHeader({ signedIn: false }),
    org: uniEsportsClub,
    events: ORG_EVENTS,
    now: MOCK_NOW,
    eventHref: (slug: string) => `/event/${slug}`,
  },
} satisfies Meta<typeof OrgPublicPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NoEvents: Story = { args: { events: [] } };
export const AdminVisiting: Story = {
  args: { header: mockHeader(), manageHref: '/o/uni-esports-club/manage' },
};
export const Mobile: Story = { globals: mobileGlobals };

import type { Meta, StoryObj } from '@storybook/react-vite';
import { mobileGlobals, mockHeader, pageParameters } from '../../mocks/header';
import { MY_ORGS } from '../../mocks/orgs';
import { MyOrgsPage } from './my-orgs-page';

const meta = {
  title: 'Pages/Org/MyOrgsPage',
  component: MyOrgsPage,
  parameters: pageParameters,
  args: {
    header: mockHeader(),
    orgs: MY_ORGS,
    orgHref: (slug: string) => `/o/${slug}/manage`,
    registerOrgHref: '/organizations/new',
  },
} satisfies Meta<typeof MyOrgsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const None: Story = { args: { orgs: [] } };
export const Mobile: Story = { globals: mobileGlobals };

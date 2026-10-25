import type { Meta, StoryObj } from '@storybook/react-vite';
import { MY_ORGS, uniEsportsClub } from '../../mocks/orgs';
import { OrgSwitcher } from './org-switcher';

const meta = {
  title: 'Blocks/Org/OrgSwitcher',
  component: OrgSwitcher,
  parameters: { layout: 'padded' },
  args: {
    current: uniEsportsClub,
    orgs: MY_ORGS,
    orgHref: (slug: string) => `/o/${slug}/manage`,
    allOrgsHref: '/orgs',
    registerOrgHref: '/organizations/new',
  },
} satisfies Meta<typeof OrgSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

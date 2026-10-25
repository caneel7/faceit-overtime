import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
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

export const Open: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Uni Esports Club, switch organization' }),
    );
    const menu = within(await within(canvasElement.ownerDocument.body).findByRole('menu'));
    await expect(menu.getByRole('menuitem', { name: /Night Owls League/ })).toHaveAttribute(
      'href',
      '/o/night-owls-league/manage',
    );
  },
};

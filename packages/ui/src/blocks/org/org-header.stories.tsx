import type { Meta, StoryObj } from '@storybook/react-vite';
import { uniEsportsClub } from '../../mocks/orgs';
import { Button } from '../../primitives/button';
import { OrgHeader } from './org-header';

const meta = {
  title: 'Blocks/Org/OrgHeader',
  component: OrgHeader,
  parameters: { layout: 'padded' },
  args: { org: uniEsportsClub, subtitle: '7 events on Overtime' },
} satisfies Meta<typeof OrgHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Public: Story = {};

export const AdminWithActions: Story = {
  args: {
    subtitle: 'You own this organization',
    actions: (
      <>
        <Button variant="outline">View public page</Button>
        <Button>Create event</Button>
      </>
    ),
  },
};

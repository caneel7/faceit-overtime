import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ADMINS, owner, PENDING_ADMINS } from '../../mocks/admins';
import { mobileGlobals } from '../../mocks/header';
import { MOCK_NOW } from '../../mocks/time';
import { AdminList } from './admin-list';

const meta = {
  title: 'Blocks/Org/AdminList',
  component: AdminList,
  args: {
    admins: ADMINS,
    pending: PENDING_ADMINS,
    viewerRole: 'owner',
    now: MOCK_NOW,
    onInvite: fn(),
    onRemove: fn(),
    onRevoke: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[36rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AdminList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPending: Story = {};
export const OwnerOnly: Story = { args: { admins: [owner], pending: [] } };
export const AdminView: Story = { args: { viewerRole: 'admin' } };
export const Mobile: Story = { globals: mobileGlobals };

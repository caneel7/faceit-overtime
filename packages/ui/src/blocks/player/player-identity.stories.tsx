import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { kestrel } from '../../mocks/players';
import { PlayerIdentity } from './player-identity';

const meta = {
  title: 'Blocks/Player/PlayerIdentity',
  component: PlayerIdentity,
  args: { nickname: kestrel.nickname, cs2Level: kestrel.cs2Level, country: kestrel.country },
} satisfies Meta<typeof PlayerIdentity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('kestrel')).toBeVisible();
    await expect(canvas.getByLabelText('FACEIT level 10')).toHaveTextContent('Lvl 10');
  },
};

export const NoAvatar: Story = {
  args: { avatarUrl: null },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('KE')).toBeVisible();
  },
};

export const NoCs2Profile: Story = {
  args: { cs2Level: null, country: null },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/Lvl/)).not.toBeInTheDocument();
  },
};

export const Small: Story = { args: { size: 'sm' } };

export const LongNickname: Story = {
  args: { nickname: 'averyveryverylongnicknamethatkeepsgoing' },
  decorators: [
    (Story) => (
      <div className="w-[200px]">
        <Story />
      </div>
    ),
  ],
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { LevelBadge } from './level-badge';

const meta = {
  title: 'Blocks/Player/LevelBadge',
  component: LevelBadge,
  args: { level: 7 },
} satisfies Meta<typeof LevelBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllLevels: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
        <LevelBadge key={level} level={level} />
      ))}
    </div>
  ),
};

export const NoLevel: Story = { args: { level: null } };

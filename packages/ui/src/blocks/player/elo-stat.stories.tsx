import type { Meta, StoryObj } from '@storybook/react-vite';
import { kestrel } from '../../mocks/players';
import { EloStat } from './elo-stat';

const meta = {
  title: 'Blocks/Player/EloStat',
  component: EloStat,
  args: { elo: kestrel.cs2Elo },
} satisfies Meta<typeof EloStat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TeamAverage: Story = { args: { elo: 1874, label: 'avg ELO' } };

export const NoElo: Story = { args: { elo: null } };

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { daysFromNow, hoursFromNow, MOCK_NOW } from '../../mocks/time';
import { LocalTime } from './local-time';

const meta = {
  title: 'Blocks/Layout/LocalTime',
  component: LocalTime,
  args: { iso: daysFromNow(2), format: 'date' },
} satisfies Meta<typeof LocalTime>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DateOnly: Story = {};

export const DateTime: Story = { args: { format: 'datetime' } };

export const RelativeFuture: Story = {
  args: { iso: hoursFromNow(52), format: 'relative', now: MOCK_NOW },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('in 2 d 4 h')).toBeVisible();
  },
};

export const RelativePast: Story = {
  args: { iso: hoursFromNow(-3.5), format: 'relative', now: MOCK_NOW },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('3 h 30 min ago')).toBeVisible();
  },
};

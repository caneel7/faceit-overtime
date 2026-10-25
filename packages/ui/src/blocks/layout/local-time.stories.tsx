import type { Meta, StoryObj } from '@storybook/react-vite';
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
};

export const RelativePast: Story = {
  args: { iso: hoursFromNow(-3.5), format: 'relative', now: MOCK_NOW },
};

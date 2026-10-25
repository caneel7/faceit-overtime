import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import {
  anyoneEvent,
  closedEvent,
  fullEvent,
  notOpenYetEvent,
  openEvent,
} from '../../mocks/events';
import { MOCK_NOW } from '../../mocks/time';
import { EligibilitySummary } from './eligibility-summary';

const meta = {
  title: 'Blocks/Event/EligibilitySummary',
  component: EligibilitySummary,
  args: { event: openEvent, now: MOCK_NOW },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EligibilitySummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Lvl 4–8')).toBeVisible();
    await expect(canvas.getByText('7 slots left')).toBeVisible();
    await expect(canvas.getByText('in 2 d 4 h')).toBeVisible();
  },
};
export const AnyLevelAnyRegion: Story = { args: { event: anyoneEvent } };
export const Full: Story = { args: { event: fullEvent } };
export const RegistrationClosed: Story = { args: { event: closedEvent } };
export const NotOpenYet: Story = { args: { event: notOpenYetEvent } };

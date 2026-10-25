import type { Meta, StoryObj } from '@storybook/react-vite';
import { anyoneEvent, openEvent } from '../../mocks/events';
import { EventSettingsView } from './event-settings-view';

const meta = {
  title: 'Blocks/Event/EventSettingsView',
  component: EventSettingsView,
  parameters: { layout: 'padded' },
  args: { settings: openEvent.settings },
} satisfies Meta<typeof EventSettingsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NoLimits: Story = { args: { settings: anyoneEvent.settings } };

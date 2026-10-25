import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { draftFormValues } from '../../mocks/events';
import { mobileGlobals } from '../../mocks/header';
import { EventForm } from './event-form';

const meta = {
  title: 'Blocks/Event/EventForm',
  component: EventForm,
  parameters: { layout: 'padded' },
  args: {
    mode: 'create',
    onSubmit: fn(),
    onSlugBlur: fn(),
    cancelHref: '/o/uni-esports-club/manage',
    appOrigin: 'https://overtime.caneel.dev',
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EventForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {};

export const Edit: Story = { args: { mode: 'edit', defaultValues: draftFormValues } };

export const SlugTaken: Story = { args: { slugStatus: 'taken' } };
export const Pending: Story = { args: { pending: true } };
export const Locked: Story = {
  args: { mode: 'edit', defaultValues: draftFormValues, error: 'locked' },
};
export const Mobile: Story = { globals: mobileGlobals };

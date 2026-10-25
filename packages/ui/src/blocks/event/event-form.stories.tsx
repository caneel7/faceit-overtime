import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { draftFormValues } from '../../mocks/events';
import { mobileGlobals } from '../../mocks/header';
import { EventForm } from './event-form';
import { EVENT_FORM_DEFAULTS } from './event-form.schema';

const meta = {
  title: 'Blocks/Event/EventForm',
  component: EventForm,
  parameters: { layout: 'padded' },
  args: { mode: 'create', onSubmit: fn(), cancelHref: '/o/uni-esports-club/manage' },
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

export const Create: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Name'), 'Autumn Cup #3');
    await userEvent.click(canvas.getByRole('button', { name: 'Create draft' }));
    await expect(args.onSubmit).toHaveBeenCalledWith({
      ...EVENT_FORM_DEFAULTS,
      name: 'Autumn Cup #3',
    });
  },
};

export const Edit: Story = { args: { mode: 'edit', defaultValues: draftFormValues } };

export const InvalidOnBlur: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const maxTeams = canvas.getByLabelText('Max teams');
    await userEvent.clear(maxTeams);
    await userEvent.type(maxTeams, '15');
    await userEvent.tab();
    await expect(canvas.getByText('Use an even number from 4 to 64.')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Create draft' }));
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const WindowOrder: Story = {
  args: {
    mode: 'edit',
    defaultValues: { ...draftFormValues, registrationClosesAt: '2026-10-30T18:00' },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Save draft' }));
    await expect(canvas.getByText('Registration has to close after it opens.')).toBeVisible();
  },
};

export const Pending: Story = { args: { pending: true } };
export const Locked: Story = {
  args: { mode: 'edit', defaultValues: draftFormValues, error: 'locked' },
};
export const Mobile: Story = { globals: mobileGlobals };

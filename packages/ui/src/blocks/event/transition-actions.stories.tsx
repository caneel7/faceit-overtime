import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { TransitionActions } from './transition-actions';

const meta = {
  title: 'Blocks/Event/TransitionActions',
  component: TransitionActions,
  parameters: { layout: 'padded' },
  args: { status: 'draft', onTransition: fn() },
} satisfies Meta<typeof TransitionActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Draft: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open registration' }));
    const dialog = within(
      await within(canvasElement.ownerDocument.body).findByRole('dialog', {
        name: 'Open registration?',
      }),
    );
    await userEvent.click(dialog.getByRole('button', { name: 'Open registration' }));
    await expect(args.onTransition).toHaveBeenCalledWith('registration_open');
  },
};

export const CancelKept: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel event' }));
    const dialog = within(
      await within(canvasElement.ownerDocument.body).findByRole('dialog', {
        name: 'Cancel this event?',
      }),
    );
    await userEvent.click(dialog.getByRole('button', { name: 'Keep event' }));
    await expect(args.onTransition).not.toHaveBeenCalled();
  },
};

export const RegistrationOpen: Story = { args: { status: 'registration_open' } };
export const RegistrationClosed: Story = { args: { status: 'registration_closed' } };
export const Live: Story = { args: { status: 'in_progress' } };
export const Finished: Story = { args: { status: 'completed' } };
export const Cancelled: Story = { args: { status: 'cancelled' } };
export const Pending: Story = { args: { status: 'registration_open', pending: true } };
export const InvalidTransition: Story = {
  args: { status: 'registration_open', error: 'invalid_transition' },
};

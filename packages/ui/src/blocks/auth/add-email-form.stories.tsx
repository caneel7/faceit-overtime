import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { AddEmailForm } from './add-email-form';

const meta = {
  title: 'Blocks/Auth/AddEmailForm',
  component: AddEmailForm,
  args: {
    suggestedEmail: 'kestrel.plays@mail.example',
    onSubmit: fn(),
    signInHref: '/signin',
  },
  decorators: [
    (Story) => (
      <div className="w-96 max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AddEmailForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Prefilled: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Send confirmation link' }));
    await expect(args.onSubmit).toHaveBeenCalledWith('kestrel.plays@mail.example');
  },
};
export const NoSuggestion: Story = { args: { suggestedEmail: null } };
export const InvalidOnBlur: Story = {
  args: { suggestedEmail: null },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Email'), 'kestrel@');
    await userEvent.tab();
    await expect(canvas.getByText('Enter a valid email address.')).toBeVisible();
  },
};
export const EmailTaken: Story = { args: { error: 'email_taken' } };
export const Pending: Story = { args: { pending: true } };
export const Sent: Story = { args: { sentTo: 'kestrel.plays@mail.example' } };

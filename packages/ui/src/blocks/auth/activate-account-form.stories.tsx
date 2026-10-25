import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { ActivateAccountForm } from './activate-account-form';

const meta = {
  title: 'Blocks/Auth/ActivateAccountForm',
  component: ActivateAccountForm,
  args: { email: 'new.helper@mail.example', onSubmit: fn() },
  decorators: [
    (Story) => (
      <div className="w-96 max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ActivateAccountForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Display name'), 'New Helper');
    await userEvent.type(canvas.getByLabelText('Password'), 'correct horse battery');
    await userEvent.click(canvas.getByRole('button', { name: 'Create account' }));
    await expect(args.onSubmit).toHaveBeenCalledWith({
      displayName: 'New Helper',
      password: 'correct horse battery',
    });
  },
};
export const ShortPasswordOnBlur: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Password'), 'short');
    await userEvent.tab();
    await expect(canvas.getByText('Use 10 to 128 characters.')).toBeVisible();
  },
};
export const Pending: Story = { args: { pending: true } };

import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
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

export const Default: Story = {};
export const Pending: Story = { args: { pending: true } };

import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
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

export const Prefilled: Story = {};
export const NoSuggestion: Story = { args: { suggestedEmail: null } };
export const EmailTaken: Story = { args: { error: 'email_taken' } };
export const Pending: Story = { args: { pending: true } };
export const Sent: Story = { args: { sentTo: 'kestrel.plays@mail.example' } };

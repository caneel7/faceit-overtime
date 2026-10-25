import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { mobileGlobals } from '../../mocks/header';
import { CreateTeamForm } from './create-team-form';

const meta = {
  title: 'Blocks/Team/CreateTeamForm',
  component: CreateTeamForm,
  args: { faceitConnected: true, connectFaceitHref: '/settings', onSubmit: fn() },
  decorators: [
    (Story) => (
      <div className="w-96 max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CreateTeamForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Team name'), 'Night Shift');
    await userEvent.type(canvas.getByLabelText('Tag'), 'NSH');
    await userEvent.click(canvas.getByRole('button', { name: 'Create team' }));
    await expect(args.onSubmit).toHaveBeenCalledWith({
      name: 'Night Shift',
      tag: 'NSH',
      role: 'player',
    });
  },
};

export const NoFaceit: Story = {
  args: { faceitConnected: false },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('radio', { name: 'Player' })).toBeDisabled();
    await expect(canvas.getByRole('radio', { name: 'Coach' })).toBeChecked();
  },
};

export const TagTooLong: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Tag'), 'NIGHTS');
    await userEvent.tab();
    await expect(canvas.getByText('Use 1 to 5 characters.')).toBeVisible();
  },
};

export const Pending: Story = { args: { pending: true } };
export const Mobile: Story = { globals: mobileGlobals };

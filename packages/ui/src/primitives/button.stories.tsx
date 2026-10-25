import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Button } from './button';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: {
    children: 'Register team',
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link', 'faceit'],
    },
    size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Register team' }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

const variants = [
  'default',
  'secondary',
  'outline',
  'ghost',
  'destructive',
  'link',
  'faceit',
] as const;

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {variants.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas }) => {
    const button = canvas.getByRole('button', { name: 'Register team' });
    await expect(button).toBeDisabled();
    button.click();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Faceit: Story = {
  args: { variant: 'faceit', children: 'Sign in with FACEIT' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Sign in with FACEIT' });
    await expect(getComputedStyle(button).backgroundColor).toBe('rgb(209, 71, 0)');
    await expect(getComputedStyle(button).textTransform).toBe('uppercase');
    await expect(button.offsetHeight).toBe(36);
  },
};

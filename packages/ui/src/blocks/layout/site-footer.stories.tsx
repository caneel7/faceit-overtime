import type { Meta, StoryObj } from '@storybook/react-vite';
import { SiteFooter } from './site-footer';

const meta = {
  title: 'Blocks/Layout/SiteFooter',
  component: SiteFooter,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

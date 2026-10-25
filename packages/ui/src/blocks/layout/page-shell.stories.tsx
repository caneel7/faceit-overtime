import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { AppHeader } from './app-header';
import { PageShell } from './page-shell';

const header = (
  <AppHeader
    nav={[
      { label: 'Events', href: '/events' },
      { label: 'Teams', href: '/teams' },
      { label: 'Organizations', href: '/organizations' },
    ]}
    userState="signed_out"
    signInHref="/signin"
    onSignOut={fn()}
  />
);

const meta = {
  title: 'Blocks/Layout/PageShell',
  component: PageShell,
  parameters: { layout: 'fullscreen' },
  args: {
    header,
    children: (
      <>
        <h1 className="text-2xl font-semibold">Page title</h1>
        <p className="text-muted-foreground">Page content goes here.</p>
      </>
    ),
  },
} satisfies Meta<typeof PageShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Wide: Story = {};

export const Narrow: Story = { args: { width: 'narrow' } };

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile360', isRotated: false } },
};

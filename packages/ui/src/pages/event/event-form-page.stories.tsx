import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { draftFormValues } from '../../mocks/events';
import { mobileGlobals, mockHeader, pageParameters } from '../../mocks/header';
import { uniEsportsClub } from '../../mocks/orgs';
import { EventFormPage } from './event-form-page';

const meta = {
  title: 'Pages/Event/EventFormPage',
  component: EventFormPage,
  parameters: pageParameters,
  args: {
    header: mockHeader(),
    org: uniEsportsClub,
    mode: 'create',
    onSubmit: fn(),
    cancelHref: '/o/uni-esports-club/manage',
  },
} satisfies Meta<typeof EventFormPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {};
export const EditDraft: Story = { args: { mode: 'edit', defaultValues: draftFormValues } };
export const Locked: Story = {
  args: { mode: 'edit', defaultValues: draftFormValues, error: 'locked' },
};
export const Mobile: Story = { globals: mobileGlobals };

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { Button } from './button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

function Example({ defaultOpen }: { defaultOpen?: boolean }) {
  return (
    <Dialog defaultOpen={defaultOpen}>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Open registration?</DialogTitle>
          <DialogDescription>Teams can register once it opens.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Keep as draft</Button>
          </DialogClose>
          <Button>Open registration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const meta = {
  title: 'Primitives/Dialog',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Open dialog' });
    await userEvent.click(trigger);
    const page = within(canvasElement.ownerDocument.body);
    const dialog = await page.findByRole('dialog', { name: 'Open registration?' });
    await expect(dialog).toContainElement(canvasElement.ownerDocument.activeElement as HTMLElement);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const Open: Story = { args: { defaultOpen: true } };

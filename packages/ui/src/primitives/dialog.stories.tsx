import type { Meta, StoryObj } from '@storybook/react-vite';
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

export const Default: Story = {};

export const Open: Story = { args: { defaultOpen: true } };

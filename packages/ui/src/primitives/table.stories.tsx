import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

function Example() {
  return (
    <Table className="w-[28rem]">
      <TableCaption>Organization admins</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Club Admin</TableCell>
          <TableCell>admin@uni-esports.club</TableCell>
          <TableCell>Owner</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Sam Referee</TableCell>
          <TableCell>sam@uni-esports.club</TableCell>
          <TableCell>Admin</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

const meta = {
  title: 'Primitives/Table',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

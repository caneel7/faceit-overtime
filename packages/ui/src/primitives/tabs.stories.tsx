import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

function Example() {
  return (
    <Tabs defaultValue="overview" className="w-96">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="rules">Rules</TabsTrigger>
        <TabsTrigger value="teams">Teams</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Swiss stage, 16 teams, best of 1.</TabsContent>
      <TabsContent value="rules">Map pool and check-in rules.</TabsContent>
      <TabsContent value="teams">No teams yet.</TabsContent>
    </Tabs>
  );
}

const meta = {
  title: 'Primitives/Tabs',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

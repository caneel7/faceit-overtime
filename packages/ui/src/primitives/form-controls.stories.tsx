import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './checkbox';
import { Label } from './label';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Textarea } from './textarea';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

function FormControls() {
  return (
    <div className="grid w-80 gap-6">
      <div className="grid gap-2">
        <Label htmlFor="bo">Best of</Label>
        <Select defaultValue="3">
          <SelectTrigger id="bo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Best of 1</SelectItem>
            <SelectItem value="3">Best of 3</SelectItem>
            <SelectItem value="5">Best of 5</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">Joining as</legend>
        <RadioGroup defaultValue="player">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="player" id="role-player" />
            <Label htmlFor="role-player">Player</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="coach" id="role-coach" />
            <Label htmlFor="role-coach">Coach</Label>
          </div>
        </RadioGroup>
      </fieldset>

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">Regions</legend>
        <div className="flex flex-wrap gap-4">
          {['EU', 'NA', 'SA'].map((region) => (
            <div key={region} className="flex items-center gap-2">
              <Checkbox id={`region-${region}`} defaultChecked={region === 'EU'} />
              <Label htmlFor={`region-${region}`}>{region}</Label>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-2">
        <Label htmlFor="rules">Rules</Label>
        <Textarea id="rules" placeholder="Map pool, check-in, disputes…" />
      </div>

      <ToggleGroup type="single" defaultValue="open" aria-label="Status">
        <ToggleGroupItem value="open">Open</ToggleGroupItem>
        <ToggleGroupItem value="live">Live</ToggleGroupItem>
        <ToggleGroupItem value="finished">Finished</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

const meta = {
  title: 'Primitives/FormControls',
  component: FormControls,
} satisfies Meta<typeof FormControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

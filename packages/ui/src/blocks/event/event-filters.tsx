'use client';

import { REGIONS, type Region } from '../../models/player';
import { Button } from '../../primitives/button';
import { Label } from '../../primitives/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../primitives/select';
import { ToggleGroup, ToggleGroupItem } from '../../primitives/toggle-group';

export type EventStatusFilter = 'all' | 'open' | 'live' | 'finished';
export type EventFilterValue = {
  status: EventStatusFilter;
  region: Region | null;
  level: number | null;
};

export const NO_FILTERS: EventFilterValue = { status: 'all', region: null, level: null };

const STATUS_OPTIONS: { value: EventStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'live', label: 'Live' },
  { value: 'finished', label: 'Finished' },
];

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function hasFilters(value: EventFilterValue): boolean {
  return value.status !== 'all' || value.region !== null || value.level !== null;
}

type EventFiltersProps = {
  value: EventFilterValue;
  onChange: (value: EventFilterValue) => void;
};

export function EventFilters({ value, onChange }: EventFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3" role="search" aria-label="Filter events">
      <ToggleGroup
        type="single"
        value={value.status}
        onValueChange={(status) => {
          if (status) onChange({ ...value, status: status as EventStatusFilter });
        }}
        aria-label="Status"
      >
        {STATUS_OPTIONS.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="grid w-36 gap-1.5">
        <Label htmlFor="filter-region" className="text-xs text-muted-foreground">
          Region
        </Label>
        <Select
          value={value.region ?? 'any'}
          onValueChange={(region) =>
            onChange({ ...value, region: region === 'any' ? null : (region as Region) })
          }
        >
          <SelectTrigger id="filter-region" className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any region</SelectItem>
            {REGIONS.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid w-36 gap-1.5">
        <Label htmlFor="filter-level" className="text-xs text-muted-foreground">
          Your FACEIT level
        </Label>
        <Select
          value={value.level === null ? 'any' : String(value.level)}
          onValueChange={(level) =>
            onChange({ ...value, level: level === 'any' ? null : Number(level) })
          }
        >
          <SelectTrigger id="filter-level" className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any level</SelectItem>
            {LEVELS.map((level) => (
              <SelectItem key={level} value={String(level)}>
                Level {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters(value) ? (
        <Button variant="ghost" size="sm" onClick={() => onChange(NO_FILTERS)}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}

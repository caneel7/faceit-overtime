import type { ReactNode } from 'react';
import type { EventSettings } from '../../models/event';
import { LocalTime } from '../layout/local-time';
import { levelRange, regionList } from './format';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <dl className="grid grid-cols-[10rem_1fr] gap-x-4 gap-y-1.5 text-sm">{children}</dl>
    </section>
  );
}

function time(iso: string | null) {
  return iso ? <LocalTime iso={iso} format="datetime" /> : 'Not set';
}

export function EventSettingsView({ settings }: { settings: EventSettings }) {
  const { swiss } = settings;
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Section title="Format">
        <Row label="Team size">
          {settings.teamSize} players
          {settings.maxSubs ? ` + ${settings.maxSubs} sub` : ', no subs'}
        </Row>
        <Row label="Max teams">{settings.maxTeams}</Row>
      </Section>
      <Section title="Eligibility">
        <Row label="FACEIT level">{levelRange(settings.minLevel, settings.maxLevel)}</Row>
        <Row label="Regions">{regionList(settings.regions)}</Row>
      </Section>
      <Section title="Registration">
        <Row label="Opens">{time(settings.registrationOpensAt)}</Row>
        <Row label="Closes">{time(settings.registrationClosesAt)}</Row>
      </Section>
      <Section title="Swiss stage">
        <Row label="Advance at">{swiss.winsToAdvance} wins</Row>
        <Row label="Eliminated at">{swiss.lossesToEliminate} losses</Row>
        <Row label="Matches">Best of {swiss.bestOf}</Row>
        <Row label="Deciding matches">Best of {swiss.deciderBestOf}</Row>
      </Section>
    </div>
  );
}

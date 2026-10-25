import type { TeamRole } from '../../models/team';
import { Badge } from '../../primitives/badge';

export function RoleBadge({ role, isCaptain = false }: { role: TeamRole; isCaptain?: boolean }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {isCaptain ? <Badge>Captain</Badge> : null}
      <Badge variant={role === 'coach' ? 'secondary' : 'outline'}>
        {role === 'coach' ? 'Coach' : 'Player'}
      </Badge>
    </span>
  );
}

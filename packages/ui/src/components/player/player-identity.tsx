import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';

type PlayerIdentityProps = {
  nickname: string;
  avatarUrl?: string | null;
  cs2Level?: number | null;
  country?: string | null;
  size?: 'sm' | 'md';
  className?: string;
};

export function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
}

export function PlayerIdentity({
  nickname,
  avatarUrl,
  cs2Level,
  country,
  size = 'md',
  className,
}: PlayerIdentityProps) {
  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <Avatar className={size === 'sm' ? 'size-6' : 'size-9'}>
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
        <AvatarFallback>{initials(nickname)}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 items-center gap-2">
        <span className={cn('truncate font-medium', size === 'sm' ? 'text-sm' : 'text-base')}>
          {nickname}
        </span>
        {cs2Level ? (
          <Badge variant="secondary" aria-label={`FACEIT level ${cs2Level}`}>
            Lvl {cs2Level}
          </Badge>
        ) : null}
        {country ? (
          <span className="text-xs text-muted-foreground" aria-label={`Country ${country}`}>
            {country}
          </span>
        ) : null}
      </div>
    </div>
  );
}

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface MemberRowProps {
  rank: number;
  did: string;
  displayName?: string;
  mrr: string | number;
  verifiedAt: string;
  showExact?: boolean;
}

export default function MemberRow({
  rank,
  did,
  displayName,
  mrr,
  verifiedAt,
  showExact = false,
}: MemberRowProps) {
  const getMedal = (rank: number) => {
    return null;
  };

  const getInitials = (name: string) => {
    if (name.startsWith('Anonymous')) return '👻';
    return name.slice(0, 2).toUpperCase();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return '1d ago';
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  const formatMRR = () => {
    if (typeof mrr === 'number' && showExact) {
      return `$${mrr.toLocaleString()} MRR`;
    }
    return mrr;
  };

  const name = displayName || `Anonymous #${did.slice(-3)}`;

  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-accent/50 rounded-lg transition-colors">
      <div className="flex items-center space-x-4 flex-1">
        <div className="w-8 text-center font-mono text-sm text-muted-foreground">
          #{rank}
        </div>
        {getMedal(rank) && (
          <span className="text-xl">{getMedal(rank)}</span>
        )}
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{name}</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="font-mono text-sm text-primary">{formatMRR()}</span>
        <Badge variant="outline" className="text-primary border-primary/50 bg-primary/5">
          {formatTime(verifiedAt)}
        </Badge>
      </div>
    </div>
  );
}


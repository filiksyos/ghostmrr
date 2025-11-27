'use client';

import { VerifiedProfile } from '@/lib/types/verification';
import { Badge } from '@/components/ui/badge';

interface VerificationStatusBadgeProps {
  profile: VerifiedProfile;
  onProfileCleared?: () => void;
}

export default function VerificationStatusBadge({ profile }: VerificationStatusBadgeProps) {
  const formatDID = (did: string) => {
    return did.slice(0, 20) + '...';
  };

  return (
    <div className="inline-flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/50 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-green-500">✓</span>
        <div className="text-sm">
          <div className="font-semibold text-foreground">
            Verified {profile.identityMode === 'public' && profile.displayName ? `as ${profile.displayName}` : 'Anonymously'}
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {formatDID(profile.did)}
          </div>
        </div>
      </div>
      
      <Badge variant="outline" className="text-xs border-primary/50 bg-primary/10">
        ${profile.metrics.mrr} MRR
      </Badge>
    </div>
  );
}


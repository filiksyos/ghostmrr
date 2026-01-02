// Browser-based verification types

export interface MRRMetrics {
  mrr: number;
  customers: number;
  tier: string;
}

export interface VerificationBadge {
  accountHash: string;
  metrics: MRRMetrics;
  timestamp: string;
  displayName?: string;
  revealExact?: boolean;
  joinedGroup?: 'exact-numbers' | '10-mrr-club';
  joinedGroups?: Array<'exact-numbers' | '10-mrr-club'>;
}

export interface VerifiedProfile {
  accountHash: string;
  metrics: MRRMetrics;
  timestamp: string;
  verifiedAt: string; // when stored in localStorage
  identityMode: 'anonymous' | 'public'; // user's choice
  displayName?: string; // only if public
  joinedGroups: Array<'exact-numbers' | '10-mrr-club'>;
}
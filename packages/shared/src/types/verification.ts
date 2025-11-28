// Shared types between CLI and Frontend

export interface MRRMetrics {
  mrr: number;
  customers: number;
  tier: string;
}

export interface VerificationBadge {
  did: string;
  metrics: MRRMetrics;
  publicKey: string;
  signature: string;
  timestamp: string;
  accountHash?: string;
}

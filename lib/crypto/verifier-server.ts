import * as ed from '@noble/ed25519';
import { VerificationBadge } from '../types/verification';

/**
 * Server-side badge verifier (Node.js compatible)
 * Uses Buffer instead of browser APIs
 */
export async function verifyBadgeServer(badge: VerificationBadge): Promise<boolean> {
  try {
    // Validate required fields exist
    if (!badge.did || !badge.publicKey || !badge.signature || !badge.metrics || !badge.timestamp) {
      return false;
    }

    // Validate DID format matches public key
    // DID format: did:key:z{first-32-chars-of-base64-publicKey}
    const expectedDidPrefix = `did:key:z${badge.publicKey.slice(0, 32)}`;
    if (badge.did !== expectedDidPrefix) {
      return false;
    }

    // Reconstruct message (include accountHash if present for cryptographic binding)
    const message = JSON.stringify({
      metrics: badge.metrics,
      timestamp: badge.timestamp,
      accountHash: badge.accountHash,
    });

    // Convert from base64 (Node.js Buffer)
    const publicKey = Buffer.from(badge.publicKey, 'base64');
    const signature = Buffer.from(badge.signature, 'base64');
    const messageBytes = Buffer.from(message, 'utf-8');

    // Verify signature
    return await ed.verifyAsync(signature, messageBytes, publicKey);
  } catch (error) {
    console.error('Server verification error:', error);
    return false;
  }
}


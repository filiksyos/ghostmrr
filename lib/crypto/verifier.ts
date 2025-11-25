import * as ed from '@noble/ed25519';
import { VerificationBadge } from '../types/verification';

export async function verifyBadge(badge: VerificationBadge): Promise<boolean> {
  try {
    // Reconstruct message
    const message = JSON.stringify({
      metrics: badge.metrics,
      timestamp: badge.timestamp,
    });

    // Convert from base64
    const publicKey = Uint8Array.from(Buffer.from(badge.publicKey, 'base64'));
    const signature = Uint8Array.from(Buffer.from(badge.signature, 'base64'));
    const messageBytes = new TextEncoder().encode(message);

    // Verify signature
    return await ed.verifyAsync(signature, messageBytes, publicKey);
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
}

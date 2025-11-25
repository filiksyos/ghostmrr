import * as ed from '@noble/ed25519';
import { VerificationBadge } from '../types/verification';

// Browser-compatible base64 decode
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function verifyBadge(badge: VerificationBadge): Promise<boolean> {
  try {
    // Reconstruct message
    const message = JSON.stringify({
      metrics: badge.metrics,
      timestamp: badge.timestamp,
    });

    // Convert from base64 (browser-compatible)
    const publicKey = base64ToUint8Array(badge.publicKey);
    const signature = base64ToUint8Array(badge.signature);
    const messageBytes = new TextEncoder().encode(message);

    // Verify signature
    return await ed.verifyAsync(signature, messageBytes, publicKey);
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
}

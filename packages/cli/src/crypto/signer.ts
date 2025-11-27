import * as ed from '@noble/ed25519';
import { MRRMetrics, VerificationBadge } from '../types/verification.js';
import { loadOrCreateKeypair } from './keypair.js';

export async function generateSignedVerification(
  metrics: MRRMetrics
): Promise<VerificationBadge> {
  // Load or create persistent Ed25519 keypair
  const { privateKey, publicKey, did } = await loadOrCreateKeypair();

  // Create message to sign
  const timestamp = new Date().toISOString();
  const message = JSON.stringify({
    metrics,
    timestamp,
  });

  // Sign message
  const messageBytes = new TextEncoder().encode(message);
  const signature = await ed.signAsync(messageBytes, privateKey);

  // Convert to base64 for JSON
  const publicKeyBase64 = Buffer.from(publicKey).toString('base64');
  const signatureBase64 = Buffer.from(signature).toString('base64');

  return {
    did,
    metrics,
    publicKey: publicKeyBase64,
    signature: signatureBase64,
    timestamp,
  };
}

export async function verifySignature(
  badge: VerificationBadge
): Promise<boolean> {
  try {
    // Reconstruct message
    const message = JSON.stringify({
      metrics: badge.metrics,
      timestamp: badge.timestamp,
    });

    // Convert from base64
    const publicKey = Buffer.from(badge.publicKey, 'base64');
    const signature = Buffer.from(badge.signature, 'base64');
    const messageBytes = new TextEncoder().encode(message);

    // Verify signature
    return await ed.verifyAsync(signature, messageBytes, publicKey);
  } catch {
    return false;
  }
}

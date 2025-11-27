import * as fs from 'fs';
import { verifySignature } from '../crypto/signer.js';
import { VerificationBadge } from '../types/verification.js';

export async function checkCommand(file: string) {
  console.log('\n👻 GhostMRR - Verify Badge\n');

  try {
    const content = fs.readFileSync(file, 'utf-8');
    const badge: VerificationBadge = JSON.parse(content);

    console.log('📄 Badge loaded:');
    console.log(`   DID: ${badge.did}`);
    console.log(`   MRR: $${badge.metrics.mrr.toLocaleString()}`);
    console.log(`   Tier: ${badge.metrics.tier}`);
    console.log(`   Timestamp: ${badge.timestamp}`);

    console.log('\n🔐 Verifying signature...');

    const isValid = await verifySignature(badge);

    if (isValid) {
      console.log('\n✅ Signature valid! Badge is authentic.\n');
    } else {
      console.log('\n❌ Signature invalid! Badge may be tampered.\n');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

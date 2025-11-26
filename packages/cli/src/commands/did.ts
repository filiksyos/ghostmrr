import * as fs from 'fs';
import inquirer from 'inquirer';
import { loadOrCreateKeypair, resetKeypair, getKeypairPath } from '../crypto/keypair.js';

export async function didShowCommand() {
  console.log('\n👻 GhostMRR - Your DID\n');

  try {
    const keypairPath = getKeypairPath();
    const { did, publicKey } = await loadOrCreateKeypair();

    console.log('🔑 Your Decentralized Identifier (DID):');
    console.log(`   ${did}\n`);

    console.log('📋 Public Key:');
    console.log(`   ${Buffer.from(publicKey).toString('base64')}\n`);

    console.log('💾 Keypair Location:');
    console.log(`   ${keypairPath}\n`);

    console.log('ℹ️  This DID will be reused for all future verifications.\n');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

export async function didResetCommand() {
  console.log('\n👻 GhostMRR - Reset DID\n');

  const keypairPath = getKeypairPath();
  const keypairExists = fs.existsSync(keypairPath);

  if (!keypairExists) {
    console.log('ℹ️  No existing keypair found. Nothing to reset.\n');
    return;
  }

  try {
    // Load current DID to show user what they're resetting
    const { did } = await loadOrCreateKeypair();
    
    console.log('⚠️  Warning: This will delete your current DID and generate a new one.');
    console.log(`   Current DID: ${did}\n`);
    console.log('   All future verifications will use a different DID.');
    console.log('   Your existing badges will still be valid, but won\'t match your new DID.\n');

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to reset your DID?',
        default: false,
      },
    ]);

    if (!confirm) {
      console.log('\n❌ Reset cancelled.\n');
      return;
    }

    resetKeypair();
    console.log('\n✅ DID reset successfully!');
    console.log('   A new DID will be generated on your next verification.\n');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}


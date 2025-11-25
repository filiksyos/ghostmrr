import inquirer from 'inquirer';
import Stripe from 'stripe';
import { calculateMetrics } from '../stripe/calculator';
import { generateSignedVerification } from '../crypto/signer';
import * as fs from 'fs';
import * as path from 'path';

export async function verifyCommand() {
  console.log('\n👻 GhostMRR - Verify Your MRR\n');

  // Prompt for Stripe API key
  const { apiKey } = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: 'Enter your Stripe Secret Key (sk_live_... or sk_test_...):',
      validate: (input) => {
        if (!input.startsWith('sk_')) {
          return 'Invalid Stripe key format. Must start with sk_';
        }
        return true;
      },
    },
  ]);

  console.log('\n🔍 Querying Stripe...');

  try {
    const stripe = new Stripe(apiKey, { apiVersion: '2024-11-20.acacia' });

    // Calculate metrics
    const metrics = await calculateMetrics(stripe);

    console.log('\n📊 Metrics calculated:');
    console.log(`   MRR: $${metrics.mrr.toLocaleString()}`);
    console.log(`   Customers: ${metrics.customers}`);
    console.log(`   Tier: ${metrics.tier}`);

    console.log('\n🔐 Generating cryptographic signature...');

    // Generate signed verification
    const verification = await generateSignedVerification(metrics);

    // Write to file
    const outputPath = path.join(process.cwd(), 'verification.json');
    fs.writeFileSync(outputPath, JSON.stringify(verification, null, 2));

    console.log('\n✅ Success! Verification badge generated.');
    console.log(`\n📄 Saved to: ${outputPath}`);
    console.log('\n🌐 Next steps:');
    console.log('   1. Go to https://ghostmrr.app/verify');
    console.log('   2. Paste the contents of verification.json');
    console.log('   3. Get your verified badge!\n');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

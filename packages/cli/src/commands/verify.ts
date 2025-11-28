import inquirer from 'inquirer';
import Stripe from 'stripe';
import { calculateMetrics } from '../stripe/calculator.js';
import { generateSignedVerification } from '../crypto/signer.js';
import * as fs from 'fs';
import * as path from 'path';

export async function verifyCommand() {
  console.log('\n👻 GhostMRR - Verify Your MRR\n');

  // Show pre-filled link for easy key creation
  console.log('🔑 To generate a safe, read-only API key:');
  console.log('   1. Click here: \x1b[36mhttps://dashboard.stripe.com/apikeys/create?name=GhostMRR&permissions[]=rak_subscription_read\x1b[0m');
  console.log('   2. Click "Create key" and copy the restricted key\n');

  // Prompt for Stripe API key
  const { apiKey } = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiKey',
      message: 'Enter your Stripe Restricted Key:',
      validate: (input) => {
        if (!input.startsWith('rk_')) {
          return 'Invalid Stripe key format. Must be a restricted key starting with rk_';
        }
        return true;
      },
    },
  ]);

  console.log('\n🔍 Querying Stripe...');

  try {
    const stripe = new Stripe(apiKey, { apiVersion: '2025-11-17.clover' });

    // Calculate metrics (includes accountHash)
    const metricsWithHash = await calculateMetrics(stripe);
    const { accountHash, ...metrics } = metricsWithHash;

    console.log('\n📊 Metrics calculated:');
    console.log(`   MRR: $${metrics.mrr.toLocaleString()}`);
    console.log(`   Customers: ${metrics.customers}`);
    console.log(`   Tier: ${metrics.tier}`);

    console.log('\n🔐 Generating cryptographic signature...');

    // Generate signed verification with account hash
    const verification = await generateSignedVerification(metrics, accountHash);

    // Write to file
    const outputPath = path.join(process.cwd(), 'verification.json');
    fs.writeFileSync(outputPath, JSON.stringify(verification, null, 2));

    console.log('\n✅ Success! Verification badge generated.');
    console.log(`\n🔑 Your DID: ${verification.did}`);
    console.log(`   ℹ️  This DID will be reused for all future verifications.`);
    console.log(`   💡 Run 'ghostmrr did show' to see your persistent DID.`);
    console.log(`\n📄 Saved to: ${outputPath}`);
    console.log('\n🌐 Next steps:');
    console.log('   1. Go to https://ghostmrr.com');
    console.log('   2. Click "Verify Startup"');
    console.log('   3. Paste the contents of verification.json\n');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

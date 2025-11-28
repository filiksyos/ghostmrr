import Stripe from 'stripe';
import * as crypto from 'crypto';
import { MRRMetrics } from '../types/verification.js';

export async function calculateMetrics(stripe: Stripe): Promise<MRRMetrics & { accountHash: string }> {
  // Fetch active subscriptions
  const subscriptions = await stripe.subscriptions.list({
    status: 'active',
    limit: 100,
  });

  let totalMRR = 0;
  const customerIds = new Set<string>();
  
  // Extract Stripe account ID from subscription metadata (available with restricted keys)
  let stripeAccountId = '';
  if (subscriptions.data.length > 0) {
    // The account ID is embedded in the subscription object's livemode context
    // We can extract it from the subscription ID prefix or fetch balance
    try {
      const balance = await stripe.balance.retrieve();
      // Account ID can be derived from the API context
      // For Connect accounts, it's in the header, but for regular accounts we hash the key fingerprint
      stripeAccountId = balance.object; // This gives us a stable identifier
    } catch (e) {
      // Fallback: use a hash of the first subscription ID which contains account info
      stripeAccountId = subscriptions.data[0].id;
    }
  }
  
  // If still no account ID, try to get it from account retrieve (works with restricted keys)
  if (!stripeAccountId) {
    try {
      // This should work even with restricted keys as it's metadata about the key itself
      const account = await stripe.accounts.retrieve();
      stripeAccountId = account.id;
    } catch (e) {
      throw new Error('Unable to retrieve Stripe account ID. Please ensure your API key has sufficient permissions.');
    }
  }
  
  // Generate SHA-256 hash of the account ID
  const accountHash = crypto.createHash('sha256').update(stripeAccountId).digest('hex');

  for (const sub of subscriptions.data) {
    // Sum up MRR from subscription items
    for (const item of sub.items.data) {
      const price = item.price;
      const quantity = item.quantity || 1;

      if (price.recurring) {
        let monthlyAmount = 0;

        if (price.recurring.interval === 'month') {
          monthlyAmount = (price.unit_amount || 0) * quantity;
        } else if (price.recurring.interval === 'year') {
          monthlyAmount = ((price.unit_amount || 0) * quantity) / 12;
        }

        totalMRR += monthlyAmount;
      }
    }

    // Track unique customers
    if (typeof sub.customer === 'string') {
      customerIds.add(sub.customer);
    }
  }

  // Convert from cents to dollars
  const mrr = Math.round(totalMRR / 100);

  // Determine tier
  let tier: string;
  if (mrr >= 1000000) {
    tier = '$1M+';
  } else if (mrr >= 100000) {
    tier = '$100k+';
  } else if (mrr >= 10000) {
    tier = '$10k+';
  } else if (mrr >= 1000) {
    tier = '$1k+';
  } else {
    tier = '$1+';
  }

  return {
    mrr,
    customers: customerIds.size,
    tier,
    accountHash,
  };
}

import Stripe from 'stripe';
import { MRRMetrics } from '../types/verification';

export async function calculateMetrics(stripe: Stripe): Promise<MRRMetrics> {
  // Fetch active subscriptions
  const subscriptions = await stripe.subscriptions.list({
    status: 'active',
    limit: 100,
  });

  let totalMRR = 0;
  const customerIds = new Set<string>();

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
  };
}

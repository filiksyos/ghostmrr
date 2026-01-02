import { NextRequest, NextResponse } from 'next';
import Stripe from 'stripe';
import crypto from 'crypto';

interface CalculateRequest {
  apiKey: string;
}

interface CalculateResponse {
  accountHash: string;
  metrics: {
    mrr: number;
    customers: number;
    tier: string;
  };
  timestamp: number;
}

function validateApiKey(apiKey: string): boolean {
  // Check if API key matches Stripe format
  const validPrefixes = ['rk_live_', 'sk_live_', 'rk_test_', 'sk_test_'];
  return validPrefixes.some(prefix => apiKey.startsWith(prefix));
}

function calculateMRR(subscriptions: Stripe.Subscription[]): { mrr: number; customers: Set<string> } {
  let mrr = 0;
  const customers = new Set<string>();

  for (const subscription of subscriptions) {
    // Add customer to set
    if (typeof subscription.customer === 'string') {
      customers.add(subscription.customer);
    } else if (subscription.customer && typeof subscription.customer === 'object') {
      customers.add(subscription.customer.id);
    }

    // Calculate MRR from subscription items
    for (const item of subscription.items.data) {
      const price = item.price;
      if (!price || price.unit_amount === null) continue;

      const amount = price.unit_amount / 100; // Convert cents to dollars
      const quantity = item.quantity || 1;

      // Convert to monthly recurring revenue based on interval
      let monthlyAmount = amount * quantity;

      switch (price.recurring?.interval) {
        case 'year':
          monthlyAmount = monthlyAmount / 12;
          break;
        case 'week':
          monthlyAmount = monthlyAmount * 4.33; // Average weeks per month
          break;
        case 'day':
          monthlyAmount = monthlyAmount * 30;
          break;
        case 'month':
        default:
          // Already monthly
          break;
      }

      mrr += monthlyAmount;
    }
  }

  return { mrr, customers };
}

function getTier(mrr: number): string {
  if (mrr < 1) return '<$1';
  if (mrr < 10) return '$1+';
  if (mrr < 100) return '$10+';
  if (mrr < 1000) return '$100+';
  if (mrr < 10000) return '$1k+';
  if (mrr < 100000) return '$10k+';
  return '$100k+';
}

export async function POST(request: NextRequest) {
  try {
    const body: CalculateRequest = await request.json();
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    if (!validateApiKey(apiKey)) {
      return NextResponse.json(
        { error: 'Invalid API key format. Expected format: rk_live_... or sk_live_...' },
        { status: 400 }
      );
    }

    // Initialize Stripe client with provided API key
    const stripe = new Stripe(apiKey);

    // Get account information
    let account: Stripe.Account;
    try {
      account = await stripe.account.retrieve();
    } catch (error: any) {
      if (error.statusCode === 401) {
        return NextResponse.json(
          { error: 'Invalid API key or insufficient permissions' },
          { status: 401 }
        );
      }
      throw error;
    }

    // Get all active subscriptions with pagination
    const allSubscriptions: Stripe.Subscription[] = [];
    let hasMore = true;
    let startingAfter: string | undefined = undefined;

    while (hasMore) {
      const response = await stripe.subscriptions.list({
        status: 'active',
        limit: 100,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });

      allSubscriptions.push(...response.data);
      hasMore = response.has_more;

      if (hasMore && response.data.length > 0) {
        startingAfter = response.data[response.data.length - 1].id;
      }
    }

    // Calculate MRR and get unique customers
    const { mrr, customers } = calculateMRR(allSubscriptions);
    const customerCount = customers.size;

    // Generate account hash
    const accountHash = crypto
      .createHash('sha256')
      .update(account.id)
      .digest('hex');

    // Determine tier
    const tier = getTier(mrr);

    const response: CalculateResponse = {
      accountHash,
      metrics: {
        mrr: Math.round(mrr * 100) / 100, // Round to 2 decimal places
        customers: customerCount,
        tier,
      },
      timestamp: Date.now(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error calculating Stripe metrics:', error.message);

    // Return sanitized error message
    return NextResponse.json(
      { error: 'Failed to calculate metrics. Please check your API key and try again.' },
      { status: 500 }
    );
  }
}

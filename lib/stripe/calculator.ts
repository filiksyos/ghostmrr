/**
 * Browser-side utilities for Stripe verification
 * Handles encryption/decryption of API keys and formatting helpers
 */

import Stripe from 'stripe';

/**
 * Encrypt API key for localStorage storage
 * Note: This is for convenience only, not security. localStorage can be accessed by JavaScript.
 */
export async function encryptApiKey(apiKey: string): Promise<string> {
  try {
    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // Create a fixed password (this is convenience encryption, not security)
    const password = 'ghostmrr-local-storage-key';

    // Derive a key from the password and salt
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the API key
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encoder.encode(apiKey)
    );

    // Combine salt + iv + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt API key');
  }
}

/**
 * Decrypt API key from localStorage
 */
export async function decryptApiKey(encrypted: string): Promise<string> {
  try {
    // Decode from base64
    const combined = new Uint8Array(
      atob(encrypted)
        .split('')
        .map(c => c.charCodeAt(0))
    );

    // Extract salt, iv, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encryptedData = combined.slice(28);

    // Derive the key
    const password = 'ghostmrr-local-storage-key';
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encryptedData
    );

    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt API key');
  }
}

/**
 * Get human-readable tier label based on MRR
 */
export function getTierLabel(mrr: number): string {
  if (mrr < 1) return '<$1';
  if (mrr < 10) return '$1+';
  if (mrr < 100) return '$10+';
  if (mrr < 1000) return '$100+';
  if (mrr < 10000) return '$1k+';
  if (mrr < 100000) return '$10k+';
  return '$100k+';
}

/**
 * Format MRR as currency
 */
export function formatMRR(mrr: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(mrr);
}

/**
 * Calculate MRR from subscriptions
 */
export function calculateMRR(subscriptions: Stripe.Subscription[]): { mrr: number; customers: Set<string> } {
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

/**
 * Generate account hash from account ID
 */
export async function generateAccountHash(accountId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(accountId);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Calculate Stripe metrics directly from browser
 */
export async function calculateStripeMetrics(apiKey: string): Promise<{
  accountHash: string;
  metrics: {
    mrr: number;
    customers: number;
    tier: string;
  };
  timestamp: number;
}> {
  // Validate API key format before proceeding
  if (!apiKey.startsWith('rk_live_')) {
    if (apiKey.startsWith('sk_live_')) {
      throw new Error('Secret keys are not supported for security reasons. Please use a restricted key (rk_live_).');
    }
    if (apiKey.startsWith('rk_test_') || apiKey.startsWith('sk_test_')) {
      throw new Error('Test mode keys are not supported. Please use a live restricted key (rk_live_).');
    }
    throw new Error('Invalid API key format. Please use a live restricted key (rk_live_).');
  }

  // Initialize Stripe client
  const stripe = new Stripe(apiKey);

  // Get account information
  const account = await stripe.account.retrieve();

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
  const accountHash = await generateAccountHash(account.id);

  // Determine tier
  const tier = getTierLabel(mrr);

  return {
    accountHash,
    metrics: {
      mrr: Math.round(mrr * 100) / 100, // Round to 2 decimal places
      customers: customerCount,
      tier,
    },
    timestamp: Date.now(),
  };
}

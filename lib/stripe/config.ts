/**
 * Stripe Product and Price Configuration
 *
 * This file contains all Stripe product and price IDs for the subscription tiers.
 * These IDs are loaded from environment variables to make the codebase portable.
 *
 * Required Environment Variables:
 * - STRIPE_PRODUCT_PRO: Product ID for Pro tier
 * - STRIPE_PRODUCT_ENTERPRISE: Product ID for Enterprise tier
 * - STRIPE_PRICE_PRO_MONTHLY: Price ID for Pro monthly billing
 * - STRIPE_PRICE_PRO_YEARLY: Price ID for Pro yearly billing
 * - STRIPE_PRICE_ENTERPRISE_MONTHLY: Price ID for Enterprise monthly billing
 * - STRIPE_PRICE_ENTERPRISE_YEARLY: Price ID for Enterprise yearly billing
 */

// Helper function to validate environment variables at runtime
function validateStripeEnv() {
  const required = [
    'STRIPE_PRODUCT_PRO',
    'STRIPE_PRODUCT_ENTERPRISE',
    'STRIPE_PRICE_PRO_MONTHLY',
    'STRIPE_PRICE_PRO_YEARLY',
    'STRIPE_PRICE_ENTERPRISE_MONTHLY',
    'STRIPE_PRICE_ENTERPRISE_YEARLY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing Stripe environment variables: ${missing.join(', ')}\n` +
      `   Make sure to set these in your .env file before using Stripe features.`
    );
  }
}

export const STRIPE_CONFIG = {
  products: {
    pro: process.env.STRIPE_PRODUCT_PRO,
    enterprise: process.env.STRIPE_PRODUCT_ENTERPRISE,
  },
  prices: {
    pro: {
      monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
      yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
    },
    enterprise: {
      monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
      yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY,
    },
  },
} as const;

/**
 * Pricing Information
 * Amounts are in cents (USD)
 */
export const PRICING = {
  free: {
    name: 'Free',
    tier: 'free' as const,
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      'Basic features',
      'Community support',
      'Regular updates',
      'Up to 5 projects',
    ],
  },
  pro: {
    name: 'Pro',
    tier: 'pro' as const,
    price: {
      monthly: 1499, // $14.99
      yearly: 14390, // $143.90 (20% discount)
    },
    features: [
      'All Free features',
      'Unlimited projects',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'API access',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    tier: 'enterprise' as const,
    price: {
      monthly: 9999, // $99.99
      yearly: 95990, // $959.90 (20% discount)
    },
    features: [
      'All Pro features',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced security',
      'SLA guarantee',
      'Training & onboarding',
      'White-label solution',
    ],
  },
} as const;

/**
 * Helper function to get price ID from tier and billing period
 */
export function getPriceId(tier: 'pro' | 'enterprise', period: 'monthly' | 'yearly'): string {
  if (typeof window === 'undefined') {
    // Only validate on server-side
    validateStripeEnv();
  }
  return STRIPE_CONFIG.prices[tier][period] || '';
}

/**
 * Helper function to get product ID from tier
 */
export function getProductId(tier: 'pro' | 'enterprise'): string {
  if (typeof window === 'undefined') {
    // Only validate on server-side
    validateStripeEnv();
  }
  return STRIPE_CONFIG.products[tier] || '';
}

/**
 * Helper function to format price for display
 */
export function formatPrice(amountInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountInCents / 100);
}

/**
 * Calculate savings for yearly plans
 */
export function calculateYearlySavings(tier: 'pro' | 'enterprise'): number {
  const monthlyTotal = PRICING[tier].price.monthly * 12;
  const yearlyPrice = PRICING[tier].price.yearly;
  return monthlyTotal - yearlyPrice;
}

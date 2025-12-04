/**
 * Stripe Server-side Client
 * Use this in Server Components, Route Handlers, and Server Actions
 */

import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * Get Stripe client instance with lazy initialization
 * This prevents errors during Next.js build process when env vars are not available
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured. Please add it to your environment variables.');
    }

    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-09-30.clover',
      appInfo: {
        name: process.env.NEXT_PUBLIC_APP_NAME || 'Lofty Apartments',
        version: '0.1.0',
      },
    });
  }

  return stripeInstance;
}

/**
 * @deprecated Use getStripe() instead for lazy initialization
 * This export is kept for backward compatibility but will be removed in the future
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    // Lazy load stripe when any property is accessed
    return getStripe()[prop as keyof Stripe];
  }
});

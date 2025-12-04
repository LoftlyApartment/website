/**
 * Stripe Webhook Handler
 *
 * Processes Stripe webhook events to keep our database in sync with Stripe
 * This endpoint is called by Stripe when events occur (payments, subscriptions, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe/server';
import { STRIPE_CONFIG } from '@/lib/stripe/config';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Get Supabase admin client with lazy initialization
 * This prevents errors during Next.js build process when env vars are not available
 */
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase credentials are not configured. Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment variables.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Helper function to map Stripe price ID to membership tier
function getTierFromPriceId(priceId: string): 'free' | 'pro' | 'enterprise' {
  // Price IDs for Pro tier (monthly and yearly)
  if (priceId === STRIPE_CONFIG.prices.pro.monthly || priceId === STRIPE_CONFIG.prices.pro.yearly) {
    return 'pro';
  }
  // Price IDs for Enterprise tier (monthly and yearly)
  if (priceId === STRIPE_CONFIG.prices.enterprise.monthly || priceId === STRIPE_CONFIG.prices.enterprise.yearly) {
    return 'enterprise';
  }
  return 'free';
}

// Helper function to map Stripe subscription status to our database enum
function mapSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status
): 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid' {
  const statusMap: Record<Stripe.Subscription.Status, any> = {
    active: 'active',
    canceled: 'canceled',
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete_expired',
    past_due: 'past_due',
    trialing: 'trialing',
    unpaid: 'unpaid',
    paused: 'canceled', // Map paused to canceled as we don't have this status
  };

  return statusMap[stripeStatus] || 'canceled';
}

// Helper function to safely convert Stripe timestamps to ISO strings
function safeTimestampToISO(timestamp: number | null | undefined): string | null {
  if (!timestamp || typeof timestamp !== 'number' || isNaN(timestamp)) {
    return null;
  }

  try {
    const date = new Date(timestamp * 1000);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString();
  } catch (error) {
    console.error('Error converting timestamp:', timestamp, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('No stripe-signature header found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Get webhook secret
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    // Initialize Stripe client
    const stripe = getStripe();

    // Initialize Supabase admin client
    const supabaseAdmin = getSupabaseAdmin();

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`Processing webhook event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer;
        console.log('Customer created:', customer.id);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata.user_id;

        if (!userId) {
          console.error('No user_id in subscription metadata');
          break;
        }

        // Get the price ID from the subscription
        const priceId = subscription.items.data[0]?.price.id;
        const productId = subscription.items.data[0]?.price.product as string;
        const tier = getTierFromPriceId(priceId);

        // Determine membership tier based on subscription status
        // Only downgrade to free if subscription is actually canceled, not just scheduled to cancel
        const effectiveTier = subscription.status === 'canceled' ? 'free' : tier;

        // Update or insert subscription
        const { error } = await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          stripe_price_id: priceId,
          stripe_product_id: productId,
          status: mapSubscriptionStatus(subscription.status),
          membership_tier: effectiveTier,
          // @ts-ignore - Stripe subscription type has current_period_start
          current_period_start: safeTimestampToISO(subscription.current_period_start),
          // @ts-ignore - Stripe subscription type has current_period_end
          current_period_end: safeTimestampToISO(subscription.current_period_end),
          cancel_at_period_end: subscription.cancel_at_period_end,
          // @ts-ignore - Stripe subscription type has canceled_at
          canceled_at: safeTimestampToISO(subscription.canceled_at),
          // @ts-ignore - Stripe subscription type has trial_start
          trial_start: safeTimestampToISO(subscription.trial_start),
          // @ts-ignore - Stripe subscription type has trial_end
          trial_end: safeTimestampToISO(subscription.trial_end),
        }, {
          onConflict: 'stripe_subscription_id'
        });

        if (error) {
          console.error('Error upserting subscription:', error);
        } else {
          console.log(`Subscription ${subscription.id} upserted for user ${userId} - cancel_at_period_end: ${subscription.cancel_at_period_end}`);

          // Also update the profiles table to sync membership_tier
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ membership_tier: effectiveTier })
            .eq('id', userId);

          if (profileError) {
            console.error('Error updating profile membership tier:', profileError);
          } else {
            console.log(`Profile membership tier updated to ${effectiveTier} for user ${userId}`);
          }

          // Revalidate the dashboard page to show updated subscription info
          revalidatePath('/dashboard');
          console.log('Dashboard cache revalidated');
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.user_id;

        if (!userId) {
          console.error('No user_id in subscription metadata');
          break;
        }

        // Update subscription status to canceled
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            membership_tier: 'free',
            canceled_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription:', error);
        } else {
          console.log(`Subscription ${subscription.id} canceled for user ${userId}`);

          // Update profile to free tier
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ membership_tier: 'free' })
            .eq('id', userId);

          if (profileError) {
            console.error('Error updating profile to free tier:', profileError);
          } else {
            console.log(`Profile updated to free tier for user ${userId}`);
          }

          // Revalidate dashboard to show cancellation
          revalidatePath('/dashboard');
          console.log('Dashboard cache revalidated after cancellation');
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Payment succeeded for invoice ${invoice.id}`);

        // If this is a subscription invoice, the subscription.updated event will handle the database update
        // @ts-ignore - Stripe invoice has subscription property
        if (invoice.subscription) {
          // @ts-ignore - Stripe invoice has subscription property
          console.log(`Invoice is for subscription ${invoice.subscription}`);
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // @ts-ignore - Stripe invoice has subscription property
        const subscriptionId = invoice.subscription as string;

        console.log(`Payment failed for invoice ${invoice.id}`);

        if (subscriptionId) {
          // Update subscription status to past_due
          const { error } = await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId);

          if (error) {
            console.error('Error updating subscription to past_due:', error);
          }
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      {
        error: 'Webhook handler failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

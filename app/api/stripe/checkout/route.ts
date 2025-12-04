/**
 * Stripe Checkout API Route
 *
 * Creates a Stripe Checkout session for subscription purchases
 * Accepts tier (pro/enterprise) and billing period (monthly/yearly)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/server';
import { getPriceId } from '@/lib/stripe/config';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Initialize Stripe client inside the handler
  const stripe = getStripe();
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { tier, period } = body;

    // Validate inputs
    if (!tier || !['pro', 'enterprise'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "pro" or "enterprise".' },
        { status: 400 }
      );
    }

    if (!period || !['monthly', 'yearly'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid billing period. Must be "monthly" or "yearly".' },
        { status: 400 }
      );
    }

    // Get the price ID from config
    const priceId = getPriceId(tier as 'pro' | 'enterprise', period as 'monthly' | 'yearly');

    // Check if user already has a subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id, membership_tier, stripe_price_id, status')
      .eq('user_id', user.id)
      .maybeSingle() as { data: {
        stripe_customer_id: string;
        stripe_subscription_id: string | null;
        membership_tier: string;
        stripe_price_id: string | null;
        status: string;
      } | null };

    let customerId: string;

    if (existingSubscription?.stripe_customer_id) {
      // Use existing customer ID
      customerId = existingSubscription.stripe_customer_id;

      // If user has an active subscription, handle upgrade/downgrade
      if (existingSubscription.stripe_subscription_id && existingSubscription.status === 'active') {
        const currentPriceId = existingSubscription.stripe_price_id;
        const newPriceId = priceId;

        // If same price, redirect to billing portal to manage subscription
        if (currentPriceId === newPriceId) {
          const billingPortalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${request.nextUrl.origin}/dashboard`,
          });

          return NextResponse.json({
            url: billingPortalSession.url,
            isPortal: true,
          });
        }

        // Different price - update the subscription
        try {
          // Retrieve the subscription to get the subscription item ID
          const subscription = await stripe.subscriptions.retrieve(
            existingSubscription.stripe_subscription_id
          );

          // Update the subscription with the new price
          await stripe.subscriptions.update(existingSubscription.stripe_subscription_id, {
            items: [
              {
                id: subscription.items.data[0].id,
                price: newPriceId,
              },
            ],
            proration_behavior: 'create_prorations', // Charge/credit for the difference
            metadata: {
              user_id: user.id,
              tier,
              period, // Track the billing period for clarity
            },
          });

          // Revalidate the dashboard to show the updated subscription
          revalidatePath('/dashboard');

          // Redirect to dashboard with success message
          return NextResponse.json({
            url: `${request.nextUrl.origin}/dashboard?upgraded=true`,
            isUpgrade: true,
          });
        } catch (error) {
          console.error('Error updating subscription:', error);
          throw error;
        }
      }
    } else {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      customerId = customer.id;

      // Store the customer ID in the database
      // @ts-ignore - Type inference issue with Supabase client
      await supabase.from('subscriptions').upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        status: 'incomplete',
        membership_tier: 'free',
      });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        tier,
        period,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          tier,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

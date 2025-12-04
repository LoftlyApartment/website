import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { syncBookingToGuestly } from '@/lib/guestly/sync';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Get Stripe client instance with lazy initialization
 */
function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured. Please add it to your environment variables.');
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-09-30.clover',
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

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
  const stripe = getStripeClient();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  console.log(`Processing webhook event: ${event.type}`);

  const supabase = await createClient();

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // Update booking status
      const { data: booking, error } = await supabase
        .from('bookings')
        // @ts-ignore - Supabase type issue with update
        .update({
          payment_status: 'completed',
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
          stripe_charge_id: paymentIntent.latest_charge as string,
        })
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .select('id')
        .single();

      if (error) {
        console.error('Error updating booking:', error);
      } else {
        console.log(`Booking confirmed for payment intent ${paymentIntent.id}`);

        // Type the booking data
        type BookingId = { id: string } | null;
        const typedBooking = booking as BookingId;

        // Sync booking to Guestly (non-blocking)
        if (typedBooking && typedBooking.id) {
          console.log(`Triggering Guestly sync for booking ${typedBooking.id}`);

          // Execute sync asynchronously - don't await or block the webhook response
          syncBookingToGuestly(typedBooking.id)
            .then((result) => {
              if (result.success) {
                console.log(`✓ Guestly sync successful for booking ${typedBooking.id}: reservation ${result.reservationId}`);
              } else {
                console.error(`✗ Guestly sync failed for booking ${typedBooking.id}: ${result.error}`);
              }
            })
            .catch((error) => {
              console.error(`✗ Guestly sync error for booking ${typedBooking.id}:`, error);
            });
        }

        // TODO: Send confirmation email to guest
      }

      break;
    }

    case 'payment_intent.payment_failed': {
      const failedIntent = event.data.object as Stripe.PaymentIntent;

      const { error } = await supabase
        .from('bookings')
        // @ts-ignore - Supabase type issue with update
        .update({
          payment_status: 'failed',
        })
        .eq('stripe_payment_intent_id', failedIntent.id);

      if (error) {
        console.error('Error updating failed payment:', error);
      } else {
        console.log(`Payment failed for payment intent ${failedIntent.id}`);
      }

      break;
    }

    case 'payment_intent.processing': {
      const processingIntent = event.data.object as Stripe.PaymentIntent;

      const { error } = await supabase
        .from('bookings')
        // @ts-ignore - Supabase type issue with update
        .update({
          payment_status: 'processing',
        })
        .eq('stripe_payment_intent_id', processingIntent.id);

      if (error) {
        console.error('Error updating processing payment:', error);
      }

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

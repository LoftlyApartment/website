import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/server';
import type { BookingInsert } from '@/types/database';

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
  try {
    const { bookingData } = await request.json();

    // Validate required data
    if (!bookingData || !bookingData.pricing) {
      return NextResponse.json(
        { error: 'Missing required booking data' },
        { status: 400 }
      );
    }

    const propertySlug = bookingData.step1.propertyId;
    console.log('[Payment API] Looking up property with slug:', propertySlug);

    // Initialize Supabase admin client (bypasses RLS)
    const supabase = createAdminClient();

    // Look up property UUID from slug FIRST (before creating payment intent)
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id')
      .eq('slug', propertySlug)
      .single() as { data: { id: string } | null; error: any };

    if (propertyError || !property) {
      console.error('[Payment API] Error finding property:', propertyError);
      console.error('[Payment API] Searched for slug:', propertySlug);
      return NextResponse.json(
        { error: 'Property not found', details: `Slug: ${propertySlug}`, propertyError },
        { status: 404 }
      );
    }

    console.log('[Payment API] Found property with UUID:', property.id);

    const propertyUuid = property.id;

    // Calculate amount in cents (Stripe requires cents)
    const amountInCents = Math.round(bookingData.pricing.total * 100);

    // Initialize Stripe client
    const stripe = getStripeClient();

    // Create payment intent with property UUID
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        property_id: propertyUuid,
        check_in: bookingData.step1.checkInDate,
        check_out: bookingData.step1.checkOutDate,
        guest_email: bookingData.step2.email,
      },
    });

    // Generate booking reference locally
    const year = new Date().getFullYear();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const bookingReference = `LA${year}-${randomNum}`;

    // Prepare booking data
    const bookingInsert: BookingInsert = {
      booking_reference: bookingReference,
      property_id: propertyUuid,
      guest_first_name: bookingData.step2.firstName,
      guest_last_name: bookingData.step2.lastName,
      guest_email: bookingData.step2.email,
      guest_phone: bookingData.step2.phone,
      guest_country: bookingData.step2.country,
      guest_company: bookingData.step2.company || null,
      check_in_date: bookingData.step1.checkInDate,
      check_out_date: bookingData.step1.checkOutDate,
      adults: bookingData.step1.adults || 1,
      children: bookingData.step1.children || 0,
      infants: bookingData.step1.infants || 0,
      nights: bookingData.pricing.nights,
      base_price: bookingData.pricing.basePrice,
      discount: bookingData.pricing.discount || 0,
      cleaning_fee: bookingData.pricing.cleaningFee,
      pet_fee: bookingData.pricing.petFee || 0,
      subtotal: bookingData.pricing.subtotal,
      vat: bookingData.pricing.vat,
      total: bookingData.pricing.total,
      special_requests: bookingData.step2.specialRequests || null,
      purpose_of_stay: bookingData.step2.purposeOfStay || null,
      has_pet: bookingData.step1.specialRequests?.pet || false,
      early_checkin: bookingData.step1.specialRequests?.earlyCheckIn || false,
      late_checkout: bookingData.step1.specialRequests?.lateCheckout || false,
      payment_status: 'pending' as const,
      stripe_payment_intent_id: paymentIntent.id,
      status: 'pending' as const,
      terms_accepted: bookingData.step2.agreeToTerms || false,
      privacy_accepted: bookingData.step2.agreeToPrivacy || false,
      marketing_consent: bookingData.step2.receiveUpdates || false,
    };

    // Create booking record
    const { error: bookingError } = await supabase
      .from('bookings')
      // @ts-ignore - Supabase type issue with insert
      .insert(bookingInsert);

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      throw new Error('Failed to create booking record');
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingReference,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      {
        error: 'Failed to create payment intent',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

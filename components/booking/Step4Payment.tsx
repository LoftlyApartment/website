'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { useBooking } from '../../lib/context/BookingContext';
import { formatPrice } from '../../lib/utils/booking';
import { ShieldIcon, ChevronLeftIcon } from '../ui/Icons';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentForm({ bookingReference }: { bookingReference: string }) {
  const t = useTranslations('booking.step4');
  const tl = useTranslations('booking');
  const locale = useLocale();
  const stripe = useStripe();
  const elements = useElements();
  const { state, previousStep, nextStep, setBookingReference } = useBooking();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/${locale}/booking?step=5&booking_reference=${bookingReference}`,
      },
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setProcessing(false);
    } else {
      // Payment succeeded - the user will be redirected to confirmation page
      setBookingReference(bookingReference);
      nextStep();
    }
  };

  const { pricing } = state;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back Navigation */}
      <button
        type="button"
        onClick={previousStep}
        disabled={processing}
        className="flex items-center gap-2 text-neutral-700 hover:text-primary-600 transition-colors group mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeftIcon size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">{tl('back')} to Pricing Details</span>
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Element */}
          <Card>
            <CardHeader>
              <CardTitle>{t('paymentMethod')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <PaymentElement />

                {error && (
                  <Alert variant="error">{error}</Alert>
                )}

                <Alert variant="info">
                  <p className="text-sm">{t('stripeNotice')}</p>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Security Badges */}
          <div className="flex items-center justify-center gap-6 py-6 bg-neutral-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-neutral-700">
              <ShieldIcon size={20} className="text-primary-600" />
              <span>{t('sslEncrypted')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-700">
              <ShieldIcon size={20} className="text-primary-600" />
              <span>{t('pciCompliant')}</span>
            </div>
          </div>
        </div>

        {/* Sticky Payment Summary */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle>{t('paymentSummary')}</CardTitle>
            </CardHeader>
            <CardContent>
              {pricing && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>{t('accommodation')}</span>
                    <span>{formatPrice(pricing.basePrice, 'de')}</span>
                  </div>

                  {pricing.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>{t('discount')}</span>
                      <span>-{formatPrice(pricing.discount, 'de')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span>{t('cleaningFee')}</span>
                    <span>{formatPrice(pricing.cleaningFee, 'de')}</span>
                  </div>

                  {pricing.petFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>{t('petFee')}</span>
                      <span>{formatPrice(pricing.petFee, 'de')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span>{t('vat')} ({pricing.vatRate}%)</span>
                    <span>{formatPrice(pricing.vat, 'de')}</span>
                  </div>

                  <div className="border-t-2 border-neutral-300 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{t('total')}</span>
                      <span className="text-2xl font-bold text-primary-600">
                        {formatPrice(pricing.total, 'de')}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-neutral-600 pt-2">
                    Booking Reference: <strong>{bookingReference}</strong>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={previousStep}
          disabled={processing}
        >
          {tl('back')}
        </Button>
        <Button
          type="submit"
          size="lg"
          loading={processing}
          disabled={!stripe || processing}
        >
          {processing ? t('processing') : t('completeBooking')}
        </Button>
      </div>
    </form>
  );
}

export function Step4Payment() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state } = useBooking();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Create payment intent when component mounts
    async function createPaymentIntent() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingData: state }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
        setBookingReference(data.bookingReference);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    }

    createPaymentIntent();
  }, [state]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading payment form...</p>
        </div>
      </div>
    );
  }

  if (error || !clientSecret || !bookingReference) {
    return (
      <Alert variant="error">
        <p>Unable to load payment form. Please try again.</p>
        {error && <p className="text-sm mt-2">{error}</p>}
      </Alert>
    );
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0070f3',
    },
  };

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance,
      }}
    >
      <PaymentForm bookingReference={bookingReference} />
    </Elements>
  );
}

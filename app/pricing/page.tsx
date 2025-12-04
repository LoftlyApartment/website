'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PRICING, formatPrice, calculateYearlySavings } from '@/lib/stripe/config';

type BillingPeriod = 'monthly' | 'yearly';

function PricingContent() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "SaaS Boilerplate";

  const handleSubscribe = async (tier: 'pro' | 'enterprise', skipConfirm = false) => {
    setLoading(tier);

    // Confirm the subscription details with the user (unless skipping for auto-checkout)
    if (!skipConfirm) {
      const tierName = tier === 'pro' ? 'Pro' : 'Enterprise';
      const periodText = billingPeriod === 'monthly' ? 'Monthly' : 'Yearly';
      const price = PRICING[tier].price[billingPeriod];
      const priceText = formatPrice(price);
      const perText = billingPeriod === 'monthly' ? 'month' : 'year';

      const confirmed = confirm(
        `You are about to subscribe to the ${tierName} plan (${periodText} billing).\n\n` +
        `Price: ${priceText}/${perText}\n\n` +
        `Click OK to proceed to checkout.`
      );

      if (!confirmed) {
        setLoading(null);
        return;
      }
    }

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          period: billingPeriod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If unauthorized (not logged in), redirect to login with return URL
        if (response.status === 401) {
          const returnUrl = `/pricing?tier=${tier}&period=${billingPeriod}&checkout=true`;
          router.push(`/auth/login?redirect=${encodeURIComponent(returnUrl)}`);
          return;
        }
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        // Show different messages based on what's happening
        if (data.isUpgrade) {
          alert('Your subscription has been updated! Redirecting to dashboard...');
        } else if (data.isPortal) {
          alert('Redirecting you to the billing portal to manage your subscription.');
        }

        // Redirect to Stripe Checkout, Billing Portal, or Dashboard
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
      setLoading(null);
    }
  };

  // Auto-trigger checkout if returning from login
  useEffect(() => {
    const shouldCheckout = searchParams.get('checkout');
    const tier = searchParams.get('tier') as 'pro' | 'enterprise' | null;
    const period = searchParams.get('period') as 'monthly' | 'yearly' | null;

    if (shouldCheckout === 'true' && tier && period) {
      // Set the billing period to match what they selected
      setBillingPeriod(period);
      // Auto-trigger the checkout (skip confirmation since they already confirmed)
      handleSubscribe(tier, true);
      // Clean up URL params
      router.replace('/pricing', { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              {appName}
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Choose the plan that's right for you
          </p>

          {/* Billing Toggle */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center space-x-4">
              <span
                className={`text-sm font-medium ${
                  billingPeriod === 'monthly'
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Monthly
              </span>
            <button
              onClick={() =>
                setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')
              }
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-blue-600"
              role="switch"
              aria-checked={billingPeriod === 'yearly'}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  billingPeriod === 'yearly' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                billingPeriod === 'yearly'
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Yearly
              <span className="ml-1.5 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                Save 20%
              </span>
            </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Current selection: <span className="text-blue-600 dark:text-blue-400 font-bold">{billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'} billing</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Free Tier */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {PRICING.free.name}
              </h3>
              <div className="flex items-baseline mb-6">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">$0</span>
                <span className="ml-2 text-gray-500 dark:text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {PRICING.free.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="h-6 w-6 text-green-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/login"
                className="block w-full text-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Pro Tier */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border-2 border-blue-500 dark:border-blue-400 relative">
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
              POPULAR
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {PRICING.pro.name}
              </h3>
              <div className="flex items-baseline mb-2">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(PRICING.pro.price[billingPeriod])}
                </span>
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  /{billingPeriod === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              {billingPeriod === 'yearly' && (
                <p className="text-sm text-green-600 dark:text-green-400 mb-6">
                  Save {formatPrice(calculateYearlySavings('pro'))} per year
                </p>
              )}
              <ul className="space-y-4 mb-8 mt-6">
                {PRICING.pro.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="h-6 w-6 text-green-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe('pro')}
                disabled={loading !== null}
                className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {loading === 'pro' ? 'Loading...' : `Get Pro (${billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'})`}
              </button>
            </div>
          </div>

          {/* Enterprise Tier */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {PRICING.enterprise.name}
              </h3>
              <div className="flex items-baseline mb-2">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(PRICING.enterprise.price[billingPeriod])}
                </span>
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  /{billingPeriod === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              {billingPeriod === 'yearly' && (
                <p className="text-sm text-green-600 dark:text-green-400 mb-6">
                  Save {formatPrice(calculateYearlySavings('enterprise'))} per year
                </p>
              )}
              <ul className="space-y-4 mb-8 mt-6">
                {PRICING.enterprise.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="h-6 w-6 text-green-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe('enterprise')}
                disabled={loading !== null}
                className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                {loading === 'enterprise' ? 'Loading...' : `Get Enterprise (${billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'})`}
              </button>
            </div>
          </div>
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            All plans include a 14-day money-back guarantee. Need help choosing?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
              Contact our sales team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PricingContent />
    </Suspense>
  );
}

'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export function SubscriptionNotifications() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const success = searchParams.get('success');
  const upgraded = searchParams.get('upgraded');

  useEffect(() => {
    // If returning from Stripe checkout or upgrade, refresh the page to show new data
    if (success === 'true' || upgraded === 'true') {
      // Clear the query parameters after a brief delay
      setTimeout(() => {
        router.replace('/dashboard');
      }, 3000);
    }
  }, [success, upgraded, router]);

  if (success === 'true') {
    return (
      <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center">
          <svg
            className="h-5 w-5 text-green-600 dark:text-green-400 mr-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-400">
              Subscription activated successfully!
            </p>
            <p className="text-sm text-green-700 dark:text-green-500 mt-1">
              Your new plan is now active. Welcome aboard!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (upgraded === 'true') {
    return (
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center">
          <svg
            className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
              Subscription upgraded successfully!
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-500 mt-1">
              Your plan has been updated. Enjoy your new features!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

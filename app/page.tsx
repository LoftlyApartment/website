import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const appName = process.env.NEXT_PUBLIC_APP_NAME || "SaaS Boilerplate";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              {appName}
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/pricing"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Pricing
              </Link>
              {user ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome to {appName}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              A Next.js application with Supabase authentication and Stripe payments
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link
                href="/pricing"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                View Pricing
              </Link>
              {!user && (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Get Started Free
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Authentication Status</h2>
            {user ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    Logged in as: {user.email}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    User ID: {user.id}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Go to Dashboard
                  </Link>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Not logged in. Sign in to access your dashboard and personalized features.
                </p>
                <div className="flex gap-3">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 space-y-2">
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                Supabase
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Authentication and database ready
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>- Magic link authentication</li>
                <li>- Server-side rendering</li>
                <li>- Protected routes</li>
              </ul>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 space-y-2">
              <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100">
                Stripe
              </h3>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Payment processing configured
              </p>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                <li>- Subscription billing</li>
                <li>- Webhook integration</li>
                <li>- Multi-tier pricing</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 space-y-2">
            <h3 className="text-lg font-semibold">Features</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>Passwordless authentication with magic links</li>
              <li>Protected dashboard with user profile</li>
              <li>Membership tier management (Free, Pro, Enterprise)</li>
              <li>Server-side session handling</li>
              <li>Complete Stripe subscription system</li>
              <li>Automatic tier upgrades and downgrades</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

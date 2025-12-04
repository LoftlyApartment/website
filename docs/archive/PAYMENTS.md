# Payment System Documentation

This document provides comprehensive information about the Stripe subscription payment system implemented in this Next.js application.

## Table of Contents

1. [Overview](#overview)
2. [Stripe Products and Prices](#stripe-products-and-prices)
3. [Architecture](#architecture)
4. [Webhook Flow](#webhook-flow)
5. [Testing Locally](#testing-locally)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This application implements a complete Stripe subscription system with three membership tiers:

- **Free Tier**: $0/month (no Stripe subscription required)
- **Pro Tier**: $14.99/month or $143.90/year (20% savings)
- **Enterprise Tier**: $99.99/month or $959.90/year (20% savings)

The system automatically handles:
- Subscription creation and upgrades
- Downgrades and cancellations
- Payment failures and retries
- Membership tier synchronization with the database

---

## Stripe Products and Prices

### Products

Created using the Stripe CLI:

```bash
# Pro Tier Product
Product ID: prod_TInpYdKeQhvTPV
Name: Pro Tier
Description: Professional tier with advanced features

# Enterprise Tier Product
Product ID: prod_TInpfSvMzJ8zv6
Name: Enterprise Tier
Description: Enterprise tier with all features and priority support
```

### Prices

All prices are in cents (USD):

| Tier       | Period  | Amount  | Price ID                          |
|------------|---------|---------|-----------------------------------|
| Pro        | Monthly | $14.99  | price_1SMCEeQ1lUJh1eUJAUJZrAen   |
| Pro        | Yearly  | $143.90 | price_1SMCEoQ1lUJh1eUJSiHkukna   |
| Enterprise | Monthly | $99.99  | price_1SMCEyQ1lUJh1eUJnEln6Hh8   |
| Enterprise | Yearly  | $959.90 | price_1SMCF1Q1lUJh1eUJJfUWrm8U   |

These IDs are stored in `/lib/stripe/config.ts` for easy reference throughout the application.

---

## Architecture

### Directory Structure

```
/app
  /api
    /stripe
      /checkout/route.ts       # Creates Stripe Checkout sessions
      /portal/route.ts         # Redirects to Stripe billing portal
    /webhooks
      /stripe/route.ts         # Handles Stripe webhook events
  /pricing/page.tsx            # Pricing page component
  /dashboard/page.tsx          # Dashboard with subscription info
  /page.tsx                    # Homepage with CTAs

/lib
  /stripe
    /config.ts                 # Stripe product/price IDs and pricing info
    /client.ts                 # Client-side Stripe instance
    /server.ts                 # Server-side Stripe instance
```

### Key Components

1. **Checkout Flow** (`/api/stripe/checkout/route.ts`)
   - Validates user authentication
   - Creates or retrieves Stripe customer
   - Creates Checkout session with selected tier and billing period
   - Redirects to Stripe hosted checkout page

2. **Webhook Handler** (`/api/webhooks/stripe/route.ts`)
   - Verifies webhook signatures for security
   - Processes subscription events
   - Updates Supabase database
   - Uses Supabase admin client to bypass RLS

3. **Billing Portal** (`/api/stripe/portal/route.ts`)
   - Allows customers to manage their subscriptions
   - Update payment methods
   - Cancel subscriptions
   - View invoices

---

## Webhook Flow

### Webhook Endpoint

```
POST /api/webhooks/stripe
```

**Important**: This endpoint must match the Stripe CLI forward URL and production webhook configuration.

### Events Handled

| Event                            | Action                                                     |
|----------------------------------|------------------------------------------------------------|
| `customer.created`               | Logs customer creation                                     |
| `customer.subscription.created`  | Creates subscription record in database                    |
| `customer.subscription.updated`  | Updates subscription status, tier, and billing dates       |
| `customer.subscription.deleted`  | Marks subscription as canceled                             |
| `invoice.payment_succeeded`      | Logs successful payment                                    |
| `invoice.payment_failed`         | Updates subscription status to `past_due`                  |

### Database Synchronization

When a subscription event occurs:

1. **Webhook receives event** from Stripe
2. **Signature is verified** using `STRIPE_WEBHOOK_SECRET`
3. **Subscription table is updated** using Supabase admin client
4. **Database trigger fires** automatically updating the user's membership tier in the `profiles` table

This is handled by the `sync_membership_tier()` trigger function defined in the migration file.

---

## Testing Locally

### 1. Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or another port if 3000 is in use).

### 2. Start the Stripe Webhook Listener

In a separate terminal:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This command will:
- Forward Stripe events to your local endpoint
- Display a webhook signing secret (starts with `whsec_`)
- Show all webhook events in real-time

**Important**: Copy the webhook signing secret and update your `.env.local` file:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_signing_secret_here
```

### 3. Test Cards

Use Stripe's test cards to simulate different scenarios:

| Card Number          | Scenario                  |
|---------------------|---------------------------|
| 4242 4242 4242 4242 | Successful payment        |
| 4000 0000 0000 9995 | Declined payment          |
| 4000 0000 0000 0341 | Attach fails              |
| 4000 0025 0000 3155 | Requires authentication   |

**Card Details**:
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

### 4. Testing the Complete Flow

#### Test Subscription Creation

1. Navigate to `http://localhost:3000`
2. Sign in or create an account
3. Click "View Pricing" or navigate to `/pricing`
4. Select a tier (Pro or Enterprise) and billing period
5. Click "Subscribe to Pro" or "Subscribe to Enterprise"
6. Complete the Stripe Checkout flow using test card `4242 4242 4242 4242`
7. Verify you're redirected to the dashboard with success message
8. Check that your membership tier is updated

#### Test Subscription Management

1. Go to your dashboard
2. Click "Manage Subscription"
3. You'll be redirected to the Stripe billing portal
4. Test cancellation, payment method updates, etc.

#### Monitor Webhook Events

While testing, watch the Stripe CLI output to see webhook events in real-time:

```bash
2025-10-25 19:36:06   --> customer.subscription.created [evt_...]
2025-10-25 19:36:06  <--  [200] POST http://localhost:3000/api/webhooks/stripe
```

A `[200]` response indicates successful processing.
A `[500]` or `[400]` response indicates an error (check your application logs).

### 5. View Events in Stripe Dashboard

1. Go to [https://dashboard.stripe.com/test/events](https://dashboard.stripe.com/test/events)
2. View all webhook events and their payloads
3. Useful for debugging and understanding event structure

---

## Database Schema

### Subscriptions Table

```sql
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Stripe identifiers
    stripe_customer_id TEXT UNIQUE NOT NULL,
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,
    stripe_product_id TEXT,

    -- Subscription details
    status subscription_status NOT NULL,
    membership_tier membership_tier NOT NULL,

    -- Billing period
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,

    -- Trial information
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### Subscription Status Enum

```sql
CREATE TYPE subscription_status AS ENUM (
    'active',
    'canceled',
    'past_due',
    'trialing',
    'incomplete',
    'incomplete_expired',
    'unpaid'
);
```

### Membership Tier Enum

```sql
CREATE TYPE membership_tier AS ENUM (
    'free',
    'pro',
    'enterprise'
);
```

### Automatic Tier Synchronization

The database uses a trigger to automatically sync the membership tier from the subscriptions table to the profiles table:

```sql
CREATE TRIGGER on_subscription_status_changed
    AFTER INSERT OR UPDATE OF status, membership_tier ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_membership_tier();
```

This means:
- When a subscription becomes `active` or `trialing`, the user's profile tier is updated
- When a subscription is `canceled`, `past_due`, or `unpaid`, the user is downgraded to `free`

---

## API Endpoints

### POST /api/stripe/checkout

Creates a Stripe Checkout session for subscription purchase.

**Request Body**:
```json
{
  "tier": "pro" | "enterprise",
  "period": "monthly" | "yearly"
}
```

**Response**:
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

**Usage**:
```typescript
const response = await fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tier: 'pro', period: 'monthly' }),
});
const { url } = await response.json();
window.location.href = url;
```

### POST /api/stripe/portal

Redirects to the Stripe billing portal for subscription management.

**Response**: HTTP 302 redirect to Stripe billing portal

**Usage**:
```html
<form action="/api/stripe/portal" method="POST">
  <button type="submit">Manage Subscription</button>
</form>
```

### POST /api/webhooks/stripe

Receives and processes Stripe webhook events.

**Headers**:
- `stripe-signature`: Webhook signature for verification

**Note**: This endpoint should only be called by Stripe. Never call it directly from your application.

---

## Troubleshooting

### Webhook Issues

#### Problem: Webhook returns 400 "Invalid signature"

**Solution**:
- Ensure `STRIPE_WEBHOOK_SECRET` in `.env.local` matches the secret from `stripe listen`
- Restart your dev server after updating environment variables

#### Problem: Webhook returns 500

**Solution**:
- Check application logs for detailed error messages
- Verify Supabase connection and `SUPABASE_SERVICE_ROLE_KEY`
- Ensure the user exists in the database before creating a subscription

#### Problem: Webhooks not being received

**Solution**:
- Verify `stripe listen` is running and forwarding to the correct URL
- Check that the port matches your Next.js dev server (usually 3000)
- Ensure no firewall is blocking connections

### Checkout Issues

#### Problem: "Unauthorized" error when clicking subscribe

**Solution**:
- User must be signed in to subscribe
- Check that authentication cookies are set properly
- Try signing out and signing back in

#### Problem: Redirected to billing portal instead of checkout

**Solution**:
- This is expected behavior if the user already has an active subscription
- Use the billing portal to manage or cancel the existing subscription

### Database Issues

#### Problem: Subscription created but tier not updating

**Solution**:
- Verify the `sync_membership_tier()` trigger is installed
- Check that the subscription status is `active` or `trialing`
- Run the migration file again if needed

#### Problem: RLS policy errors in webhook

**Solution**:
- Ensure the webhook is using the Supabase admin client (bypasses RLS)
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly

---

## Production Deployment

### Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Webhook Configuration

1. Go to [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your production URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `customer.created`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret and add to your environment variables

### Testing in Production

1. Use Stripe test mode first
2. Make a test purchase using test cards
3. Verify webhooks are received (check Stripe dashboard events)
4. Switch to live mode only after thorough testing

---

## Additional Resources

- [Stripe Subscription Documentation](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Stripe webhook logs in the dashboard
3. Check application logs for error messages
4. Refer to Stripe and Supabase documentation

---

**Last Updated**: October 25, 2025

# Quick Start Guide - Stripe Subscription System

## Start the Development Environment

### 1. Terminal 1 - Next.js Dev Server
```bash
cd /Users/davison/streamproject
npm run dev
```

Server will start at: http://localhost:3000

### 2. Terminal 2 - Stripe Webhook Listener
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Important**: Copy the webhook signing secret from the output and update `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

---

## Quick Test Flow (5 Minutes)

### Test a Pro Subscription

1. **Open the app**: http://localhost:3000
2. **Sign in** or create account (magic link)
3. **Go to Pricing**: Click "View Pricing" in navigation
4. **Subscribe to Pro**: Click "Subscribe to Pro" button
5. **Complete checkout**:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - ZIP: `12345`
6. **Verify dashboard**: Check your tier updated to "Pro Plan"
7. **Check billing details**: Next billing date should be shown

### Test Subscription Management

1. **Click "Manage Subscription"** in dashboard
2. **You'll see Stripe billing portal** with:
   - Payment method
   - Billing history
   - Cancel subscription option
   - Update payment method

---

## Stripe Products & Price IDs

### Quick Reference

```typescript
// Pro Tier
Product: prod_TInpYdKeQhvTPV
Monthly: price_1SMCEeQ1lUJh1eUJAUJZrAen ($14.99)
Yearly:  price_1SMCEoQ1lUJh1eUJSiHkukna ($143.90, save $35.98)

// Enterprise Tier
Product: prod_TInpfSvMzJ8zv6
Monthly: price_1SMCEyQ1lUJh1eUJnEln6Hh8 ($99.99)
Yearly:  price_1SMCF1Q1lUJh1eUJJfUWrm8U ($959.90, save $239.98)
```

All stored in: `/lib/stripe/config.ts`

---

## Key URLs

- **Homepage**: http://localhost:3000
- **Pricing**: http://localhost:3000/pricing
- **Dashboard**: http://localhost:3000/dashboard (requires login)
- **Stripe Dashboard**: https://dashboard.stripe.com/test/dashboard
- **Stripe Events**: https://dashboard.stripe.com/test/events

---

## Test Cards

| Card Number          | Result                  |
|---------------------|-------------------------|
| 4242 4242 4242 4242 | Success                 |
| 4000 0000 0000 9995 | Declined                |
| 4000 0000 0000 0341 | Attachment fails        |

Always use:
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

---

## Webhook Events to Watch

When you subscribe, you'll see these events in the Stripe CLI:

```
--> customer.created
--> customer.subscription.created ✅ (Database updated)
--> invoice.created
--> payment_intent.created
--> payment_intent.succeeded
--> invoice.payment_succeeded ✅ (Payment confirmed)
--> charge.succeeded
```

Look for `[200]` responses = Success!

---

## Common Commands

### Check if servers are running
```bash
ps aux | grep -E "next dev|stripe listen" | grep -v grep
```

### View webhook logs
```bash
tail -f /tmp/stripe-webhook.log
```

### Stop all servers
```bash
pkill -f "next dev"
pkill -f "stripe listen"
```

### Restart everything
```bash
# Kill existing
pkill -f "next dev"
pkill -f "stripe listen"

# Start fresh
npm run dev &
sleep 3
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## File Locations

```
Key Files:
/lib/stripe/config.ts              - Stripe configuration & price IDs
/app/api/stripe/checkout/route.ts  - Checkout session creation
/app/api/webhooks/stripe/route.ts  - Webhook handler
/app/pricing/page.tsx              - Pricing page
/app/dashboard/page.tsx            - Dashboard with subscription info

Documentation:
/PAYMENTS.md                       - Full payment system docs
/IMPLEMENTATION_SUMMARY.md         - Complete implementation guide
/QUICK_START.md                    - This file
```

---

## Troubleshooting

### Webhook returns 400 "Invalid signature"
- Update `STRIPE_WEBHOOK_SECRET` in `.env.local`
- Restart Next.js dev server: `npm run dev`

### Port 3000 already in use
- Kill existing: `pkill -f "next dev"`
- Or use different port: Server will suggest one

### Database not updating
- Check Stripe CLI shows `[200]` responses
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check user is logged in before subscribing

---

## Need More Help?

- **Full Documentation**: See `/PAYMENTS.md`
- **Implementation Details**: See `/IMPLEMENTATION_SUMMARY.md`
- **Stripe Docs**: https://stripe.com/docs/billing/subscriptions
- **Supabase Docs**: https://supabase.com/docs

---

**Last Updated**: October 25, 2025

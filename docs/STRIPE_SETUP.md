# Stripe Setup Guide

## Quick Start

This guide will help you set up Stripe for the booking system in **5 minutes**.

## Step 1: Get Your Stripe API Keys

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register) (or login)
2. Navigate to **Developers → API keys**
3. You'll see two keys in **Test mode**:
   - **Publishable key**: Starts with `pk_test_...`
   - **Secret key**: Click **Reveal** to see it (starts with `sk_test_...`)

## Step 2: Update Environment Variables

Open `/Website/.env.local` and update these lines:

```env
# Replace these with your actual Stripe test keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
```

**Important:**
- The publishable key is safe to expose (used in browser)
- The secret key must be kept private (server-side only)
- Never commit these keys to version control

## Step 3: Set Up Webhook for Local Development

### Install Stripe CLI (one-time setup)

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

**Windows:**
Download from [GitHub Releases](https://github.com/stripe/stripe-cli/releases)

### Login to Stripe CLI

```bash
stripe login
```

This will open your browser to confirm the connection.

### Forward Webhooks to Your Local Server

In a **separate terminal window**, run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_abc123xyz... (^C to quit)
```

### Copy the Webhook Secret

Copy the `whsec_...` secret and add it to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_abc123xyz_your_actual_secret_here
```

## Step 4: Start Your Development Server

```bash
npm run dev
```

## Step 5: Test the Integration

1. Navigate to the booking page: `http://localhost:3000/booking`
2. Fill in the booking form (Steps 1-3)
3. On Step 4 (Payment), use a test card:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
4. Click "Complete Booking"
5. Check your Stripe dashboard to see the payment
6. Check your database to see the booking record

## Verification Checklist

- [ ] Environment variables updated in `.env.local`
- [ ] Stripe CLI installed and logged in
- [ ] Webhook forwarding running (`stripe listen...`)
- [ ] Development server running (`npm run dev`)
- [ ] Test payment successful
- [ ] Booking created in database
- [ ] Webhook event received and processed

## Common Issues

### Issue: "Invalid API Key"
**Solution:** Make sure you copied the entire key including the `pk_test_` or `sk_test_` prefix.

### Issue: "Webhook signature verification failed"
**Solution:**
- Ensure the webhook secret in `.env.local` matches the one from `stripe listen`
- Restart your dev server after updating `.env.local`
- Make sure `stripe listen` is running

### Issue: "Payment succeeds but booking not confirmed"
**Solution:**
- Check the terminal running `stripe listen` for webhook events
- Check your dev server logs for errors
- Verify webhook secret is correct

## Production Setup (When You're Ready)

### 1. Activate Your Stripe Account

Before going live:
- Complete business profile in Stripe Dashboard
- Add bank account for payouts
- Enable payment methods

### 2. Get Live API Keys

1. Go to **Developers → API keys**
2. Toggle from **Test mode** to **Live mode**
3. Copy the live keys (start with `pk_live_` and `sk_live_`)

### 3. Set Production Environment Variables

In your production environment (Vercel, Railway, etc.):

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_key
STRIPE_SECRET_KEY=sk_live_your_production_secret
```

### 4. Register Production Webhook

1. Go to **Developers → Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your production URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.processing`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to production environment variables:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
   ```

## Security Reminders

🔒 **Never commit API keys to Git**
🔒 **Never use live keys in development**
🔒 **Never expose secret keys to the client**
🔒 **Always verify webhook signatures**
🔒 **Keep Stripe CLI and packages updated**

## Testing Resources

- **Test Cards:** See `/docs/STRIPE_TESTING.md`
- **Stripe Dashboard:** [https://dashboard.stripe.com/test/payments](https://dashboard.stripe.com/test/payments)
- **Webhook Logs:** [https://dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)
- **API Logs:** [https://dashboard.stripe.com/test/logs](https://dashboard.stripe.com/test/logs)

## Need Help?

- 📖 [Stripe Documentation](https://stripe.com/docs)
- 💬 [Stripe Support](https://support.stripe.com/)
- 🐛 Check `/docs/STRIPE_TESTING.md` for common issues
- 📋 See `/docs/STRIPE_IMPLEMENTATION.md` for technical details

## Quick Command Reference

```bash
# Install Stripe CLI (macOS)
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks (keep running in separate terminal)
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed

# View webhook event logs
stripe logs tail

# Test a specific payment intent
stripe payment_intents create --amount=10000 --currency=eur
```

## Success Indicators

When everything is working:
- ✅ Payment form loads without errors
- ✅ Test payment succeeds
- ✅ Booking appears in database with `status: 'confirmed'`
- ✅ Webhook events appear in `stripe listen` terminal
- ✅ Payment appears in Stripe Dashboard
- ✅ No errors in browser console or server logs

You're all set! 🎉

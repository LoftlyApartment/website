# Stripe Local Development Setup

This document provides instructions for working with Stripe in your local development environment.

## What Was Configured

### 1. Stripe CLI
- **Status**: Already installed via Homebrew
- **Version**: 1.30.0
- **Location**: `/opt/homebrew/bin/stripe`
- **Account**: Grove sandbox (acct_1Rb8rbQ1lUJh1eUJ)
- **Mode**: Test mode

### 2. Environment Variables Added

The following Stripe variables have been added to `/Users/davison/streamproject/.env`:

```bash
STRIPE_PUBLISHABLE_KEY=pk_test_51Rb8rbQ1lUJh1eUJ...
STRIPE_SECRET_KEY=sk_test_51Rb8rbQ1lUJh1eUJ...
STRIPE_WEBHOOK_SECRET=whsec_28f2935b82104ebe010e4322af4c155be2df06d3e851e75f10ec73dd18bbe783
```

### 3. Webhook Listener
- **Status**: Running in background
- **Forwarding to**: `localhost:4000/api/webhooks/stripe`
- **Log file**: `/tmp/stripe-webhook.log`
- **API Version**: 2025-05-28.basil

## How to Access Stripe Dashboard

### Test Mode Dashboard
- **URL**: https://dashboard.stripe.com/test/dashboard
- **API Keys**: https://dashboard.stripe.com/test/apikeys
- **Webhooks**: https://dashboard.stripe.com/test/webhooks
- **Logs**: https://dashboard.stripe.com/test/logs
- **Events**: https://dashboard.stripe.com/test/events

### Getting Test API Keys
1. Go to https://dashboard.stripe.com/test/apikeys
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`) - Use this in your frontend/client code
   - **Secret key** (starts with `sk_test_`) - Use this in your backend/server code (keep it secret!)

## Managing the Webhook Listener

A convenient script has been created at `/Users/davison/streamproject/stripe-webhook.sh` to manage the webhook listener.

### Usage

```bash
# Start the webhook listener
./stripe-webhook.sh start

# Stop the webhook listener
./stripe-webhook.sh stop

# Restart the webhook listener
./stripe-webhook.sh restart

# Check status
./stripe-webhook.sh status

# View live logs (Ctrl+C to exit)
./stripe-webhook.sh logs
```

### Manual Commands

If you prefer to run commands manually:

```bash
# Start webhook listener
stripe listen --forward-to localhost:4000/api/webhooks/stripe

# Start with custom port
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Get webhook secret
stripe listen --forward-to localhost:4000/api/webhooks/stripe --print-secret

# Stop all webhook listeners
pkill -f "stripe listen"
```

## Environment Variables Explained

### STRIPE_PUBLISHABLE_KEY
- **Usage**: Client-side (frontend) code
- **Security**: Safe to expose in browser/mobile apps
- **Format**: `pk_test_*` (test) or `pk_live_*` (production)
- **Purpose**: Initialize Stripe.js, create payment elements

### STRIPE_SECRET_KEY
- **Usage**: Server-side (backend) code only
- **Security**: MUST be kept secret, never expose to clients
- **Format**: `sk_test_*` (test) or `sk_live_*` (production)
- **Purpose**: Create charges, customers, subscriptions, etc.

### STRIPE_WEBHOOK_SECRET
- **Usage**: Server-side webhook endpoint
- **Security**: Keep secret, used to verify webhook signatures
- **Format**: `whsec_*`
- **Purpose**: Validate that webhook events actually came from Stripe
- **Note**: This secret is specific to the webhook listener. In production, you'll get a different secret when you register your webhook endpoint in the Stripe dashboard.

## Testing Stripe Integration

### Trigger Test Webhooks

You can trigger test webhook events using the Stripe CLI:

```bash
# Trigger a payment succeeded event
stripe trigger payment_intent.succeeded

# Trigger a customer created event
stripe trigger customer.created

# Trigger a subscription created event
stripe trigger customer.subscription.created

# See all available events
stripe trigger --help
```

### Test Card Numbers

Use these test card numbers in your application:

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Succeeds and immediately processes the payment |
| 4000 0025 0000 3155 | Requires authentication (3D Secure 2) |
| 4000 0000 0000 9995 | Always fails with a declined card error |
| 4000 0000 0000 0341 | Attaches and charges successfully but fails later |

- Use any future expiration date (e.g., 12/34)
- Use any 3-digit CVC (e.g., 123)
- Use any postal code (e.g., 12345)

### View Webhook Events

```bash
# View recent webhook events in terminal
stripe events list

# View detailed event
stripe events retrieve evt_xxxxxxxxxxxxx
```

## Important Notes for Production

When you're ready to go to production:

1. **Switch to Live Mode**
   - Get live API keys from https://dashboard.stripe.com/apikeys
   - Update your `.env` with live keys (use `.env.production` or similar)
   - NEVER commit live keys to version control

2. **Register Production Webhook Endpoint**
   - Go to https://dashboard.stripe.com/webhooks
   - Add your production webhook URL (e.g., `https://yourdomain.com/api/webhooks/stripe`)
   - Copy the webhook signing secret to your production environment variables

3. **Security Checklist**
   - Always verify webhook signatures using `STRIPE_WEBHOOK_SECRET`
   - Never log full card numbers or sensitive data
   - Use HTTPS for all production endpoints
   - Keep secret keys out of version control
   - Use environment-specific `.env` files

## Troubleshooting

### Webhook listener not receiving events
1. Check if the listener is running: `./stripe-webhook.sh status`
2. Verify your application is running on port 4000
3. Check webhook endpoint path: `/api/webhooks/stripe`
4. View logs: `./stripe-webhook.sh logs`

### Authentication errors
```bash
# Re-login to Stripe
stripe login

# Check current configuration
stripe config --list
```

### Update Stripe CLI
```bash
# Update via Homebrew
brew upgrade stripe/stripe-cli/stripe
```

## Useful Resources

- **Stripe Documentation**: https://stripe.com/docs
- **API Reference**: https://stripe.com/docs/api
- **Testing Guide**: https://stripe.com/docs/testing
- **Webhooks Guide**: https://stripe.com/docs/webhooks
- **CLI Reference**: https://stripe.com/docs/cli

## Support

If you encounter issues:
1. Check the webhook logs: `cat /tmp/stripe-webhook.log`
2. Review Stripe dashboard logs: https://dashboard.stripe.com/test/logs
3. Consult Stripe documentation: https://stripe.com/docs
4. Contact Stripe support: https://support.stripe.com

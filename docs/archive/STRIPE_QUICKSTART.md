# Stripe Quick Reference

## Environment Variables
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Use in frontend
STRIPE_SECRET_KEY=sk_test_...       # Use in backend (keep secret!)
STRIPE_WEBHOOK_SECRET=whsec_...     # Verify webhook signatures
```

## Webhook Listener Commands
```bash
./stripe-webhook.sh start    # Start listener
./stripe-webhook.sh stop     # Stop listener
./stripe-webhook.sh status   # Check status
./stripe-webhook.sh logs     # View logs
```

## Webhook Configuration
- **Local endpoint**: `http://localhost:4000/api/webhooks/stripe`
- **Log file**: `/tmp/stripe-webhook.log`

## Quick Links
- **Dashboard**: https://dashboard.stripe.com/test/dashboard
- **API Keys**: https://dashboard.stripe.com/test/apikeys
- **Webhooks**: https://dashboard.stripe.com/test/webhooks
- **Logs**: https://dashboard.stripe.com/test/logs
- **Docs**: https://stripe.com/docs

## Test Cards
- **Success**: 4242 4242 4242 4242
- **Requires Auth**: 4000 0025 0000 3155
- **Decline**: 4000 0000 0000 9995

Use any future date, any CVC, any postal code.

## Trigger Test Events
```bash
stripe trigger payment_intent.succeeded
stripe trigger customer.created
stripe trigger customer.subscription.created
```

## Your Account
- **Account**: Grove sandbox
- **Account ID**: acct_1Rb8rbQ1lUJh1eUJ
- **API Version**: 2025-05-28.basil
- **Mode**: Test mode

For complete documentation, see: [STRIPE_SETUP.md](/Users/davison/streamproject/STRIPE_SETUP.md)

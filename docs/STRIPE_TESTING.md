# Stripe Testing Guide

This guide provides information for testing the Stripe payment integration in the booking system.

## Test Cards

Use these test card numbers for different scenarios:

### Success Scenarios
- **Standard Success**: `4242 4242 4242 4242`
- **Success with 3D Secure**: `4000 0025 0000 3155`
- **Visa (debit)**: `4000 0566 5566 5556`
- **Mastercard**: `5555 5555 5555 4444`
- **American Express**: `3782 822463 10005`

### Decline Scenarios
- **Generic Decline**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Lost Card**: `4000 0000 0000 9987`
- **Stolen Card**: `4000 0000 0000 9979`
- **Expired Card**: `4000 0000 0000 0069`
- **Incorrect CVC**: `4000 0000 0000 0127`
- **Processing Error**: `4000 0000 0000 0119`

### Special Scenarios
- **Requires Authentication**: `4000 0025 0000 3155`
- **Always Requires Authentication**: `4000 0027 6000 3184`
- **Charge Declined After Successful Authentication**: `4000 0082 6000 0028`

## Test Data

When using test cards, use any of the following:

- **Expiry Date**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP/Postal Code**: Any 5 digits (e.g., `12345`)
- **Name**: Any name (e.g., `Test User`)

## Testing Flow

1. **Start a Booking**: Navigate to the booking page and select a property and dates
2. **Fill Guest Information**: Complete step 2 with test data
3. **Review Pricing**: Verify pricing calculations in step 3
4. **Process Payment**: Use a test card in step 4
5. **Verify Confirmation**: Check that step 5 shows booking confirmation

## Webhook Testing

### Local Development

To test webhooks locally, use the Stripe CLI:

```bash
# Install Stripe CLI (if not already installed)
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The Stripe CLI will provide a webhook signing secret. Add it to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Testing Webhook Events

Trigger test webhook events:

```bash
# Test successful payment
stripe trigger payment_intent.succeeded

# Test failed payment
stripe trigger payment_intent.payment_failed

# Test processing payment
stripe trigger payment_intent.processing
```

## Verifying Payment in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/payments)
2. Navigate to **Payments** section
3. Find your test payment
4. Verify:
   - Amount matches booking total (in cents)
   - Currency is EUR
   - Metadata includes property_id, check_in, check_out, guest_email
   - Status is correct

## Database Verification

After a successful payment, verify in your database:

```sql
-- Check booking was created
SELECT * FROM bookings
WHERE stripe_payment_intent_id = 'pi_...';

-- Verify payment status
SELECT booking_reference, payment_status, status, confirmed_at
FROM bookings
WHERE guest_email = 'test@example.com'
ORDER BY created_at DESC
LIMIT 1;
```

Expected values after successful payment:
- `payment_status`: `completed`
- `status`: `confirmed`
- `confirmed_at`: timestamp of confirmation
- `stripe_charge_id`: present

## Common Issues

### Payment Intent Creation Fails
- Check Stripe API keys are correctly set in `.env.local`
- Verify booking data is complete
- Check Supabase connection

### Webhook Not Received
- Ensure webhook secret matches Stripe CLI output
- Verify webhook endpoint is accessible
- Check webhook signature verification

### Payment Succeeds but Booking Not Confirmed
- Check webhook handler logs
- Verify payment_intent_id matches in database
- Ensure webhook signature is valid

## Production Setup

For production deployment:

1. **Update Environment Variables**: Replace test keys with live keys
2. **Register Webhook Endpoint**: Add `https://yourdomain.com/api/stripe/webhook` in Stripe Dashboard
3. **Update Webhook Secret**: Use production webhook secret
4. **Test with Live Mode**: Use real cards in live mode (NOT test mode)

## Security Notes

- Never commit Stripe API keys to version control
- Always use environment variables
- Test mode keys start with `sk_test_` and `pk_test_`
- Live mode keys start with `sk_live_` and `pk_live_`
- Webhook secrets start with `whsec_`

## Support

For more information:
- [Stripe Testing Docs](https://stripe.com/docs/testing)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Payment Intents API](https://stripe.com/docs/payments/payment-intents)

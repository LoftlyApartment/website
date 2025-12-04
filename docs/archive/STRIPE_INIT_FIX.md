# Stripe Initialization Fix - Build Error Resolution

## Problem
Next.js build was failing with the following errors:
```
Error: Neither apiKey nor config.authenticator provided
Error: Failed to collect page data for /api/stripe/checkout
```

**Root Cause:** Stripe SDK was being initialized at module level (during import) in multiple files. During Next.js build process, when collecting page data, these modules are loaded even though environment variables may not be available, causing the initialization to fail.

## Solution
Implemented **lazy initialization** pattern for all Stripe instances. Stripe is now only initialized when actually called (at runtime), not during the build process.

## Files Modified

### 1. `/lib/stripe/server.ts`
**Changes:**
- Replaced module-level initialization with lazy initialization using `getStripe()` function
- Added Proxy to maintain backward compatibility with existing imports
- Added proper error handling for missing `STRIPE_SECRET_KEY`

**Before:**
```typescript
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});
```

**After:**
```typescript
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-09-30.clover',
    });
  }
  return stripeInstance;
}

// Backward compatibility with Proxy
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe];
  }
});
```

### 2. `/integrations/stripe/client.ts`
**Changes:**
- Replaced module-level initialization and error throwing with lazy initialization
- Added Proxy for backward compatibility
- Removed module-level check that would fail during build

**Before:**
```typescript
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not configured');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
});
```

**After:**
```typescript
function getStripeClient(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-09-30.clover',
    });
  }
  return stripeInstance;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripeClient()[prop as keyof Stripe];
  }
});
```

### 3. `/app/api/stripe/create-payment-intent/route.ts`
**Changes:**
- Added `getStripeClient()` function with lazy initialization
- Initialize Stripe within the POST handler, not at module level

**Before:**
```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export async function POST(request: NextRequest) {
  // ... use stripe
}
```

**After:**
```typescript
function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-09-30.clover',
  });
}

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  // ... use stripe
}
```

### 4. `/app/api/stripe/webhook/route.ts`
**Changes:**
- Added `getStripeClient()` function with lazy initialization
- Initialize Stripe and validate webhook secret within the POST handler
- Removed module-level initialization

**Before:**
```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  // ... use stripe and webhookSecret
}
```

**After:**
```typescript
function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-09-30.clover',
  });
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }
  
  const stripe = getStripeClient();
  // ... use stripe and webhookSecret
}
```

### 5. `/app/api/webhooks/stripe/route.ts`
**Changes:**
- Changed import from `{ stripe }` to `{ getStripe }`
- Added `getSupabaseAdmin()` function for lazy Supabase initialization
- Initialize both Stripe and Supabase within the POST handler
- Removed module-level initialization with placeholder values

**Before:**
```typescript
import { stripe } from '@/lib/stripe/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key',
  { ... }
);

export async function POST(request: NextRequest) {
  // ... use stripe and supabaseAdmin
}
```

**After:**
```typescript
import { getStripe } from '@/lib/stripe/server';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase credentials are not configured');
  }
  
  return createClient(supabaseUrl, serviceRoleKey, { ... });
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const supabaseAdmin = getSupabaseAdmin();
  // ... use stripe and supabaseAdmin
}
```

### 6. `/lib/stripe/client.ts` (Bonus)
**Changes:**
- Added validation for `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Return null gracefully if key is missing instead of throwing error

**Before:**
```typescript
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
  }
  return stripePromise;
};
```

**After:**
```typescript
export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured');
      return Promise.resolve(null);
    }
    
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};
```

## Files NOT Modified (Using Proxy)
These files continue to work without modification due to the Proxy pattern:
- `/app/api/stripe/checkout/route.ts` - imports `{ stripe }` from `@/lib/stripe/server`
- `/app/api/stripe/portal/route.ts` - imports `{ stripe }` from `@/lib/stripe/server`

## Build Test Results

**Before Fix:**
```
Error: Neither apiKey nor config.authenticator provided
Error: Failed to collect page data for /api/stripe/checkout
```

**After Fix:**
```
✓ Compiled successfully in 3.2s
✓ Generating static pages (49/49) in 374.8ms

Route (app)
├ ƒ /api/stripe/checkout
├ ƒ /api/stripe/create-payment-intent
├ ƒ /api/stripe/portal
├ ƒ /api/stripe/webhook
├ ƒ /api/webhooks/stripe
...

Build completed successfully!
```

## Key Principles Applied

1. **Lazy Initialization**: Only initialize SDK clients when they're actually needed (at runtime)
2. **No Module-Level Side Effects**: Avoid executing code that requires environment variables during module import
3. **Graceful Error Handling**: Provide clear error messages when environment variables are missing
4. **Backward Compatibility**: Use Proxy pattern to avoid breaking existing code that imports `stripe` directly

## Environment Variables Required

For production deployment, ensure these environment variables are set:

**Server-side:**
- `STRIPE_SECRET_KEY` - Required for all API routes
- `STRIPE_WEBHOOK_SECRET` - Required for webhook routes
- `SUPABASE_SERVICE_ROLE_KEY` - Required for webhook handlers
- `NEXT_PUBLIC_SUPABASE_URL` - Required for webhook handlers

**Client-side:**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Required for client-side Stripe usage

## Deployment Checklist

- [x] All Stripe initializations use lazy loading
- [x] No module-level environment variable access with `!` assertion
- [x] Proper error handling for missing environment variables
- [x] Build passes locally without errors
- [x] All API routes properly initialize Stripe at runtime
- [ ] Environment variables configured in Vercel
- [ ] Production build tested in Vercel

## Next Steps

1. Deploy to Vercel
2. Verify all environment variables are set in Vercel project settings
3. Monitor build logs to ensure no errors
4. Test all Stripe functionality in production (checkout, webhooks, portal)

---

**Date:** 2025-11-11
**Issue:** Vercel build failure due to Stripe initialization
**Status:** ✅ RESOLVED

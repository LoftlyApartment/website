# Next.js SaaS Boilerplate with Claude Code

A production-ready SaaS boilerplate with Next.js, Supabase authentication, and Stripe subscription payments. **Featuring fully automated setup via Claude Code** - go from zero to running SaaS in minutes!

## 🤖 Built for Claude Code

This boilerplate is designed to work seamlessly with [Claude Code](https://claude.com/claude-code) - Anthropic's AI coding assistant. With a single slash command (`/setup-boilerplate`), Claude Code will:

- ✅ **Automatically start** your local Supabase instance
- ✅ **Create and populate** all environment files with credentials
- ✅ **Authenticate you** with Stripe via browser login
- ✅ **Create Stripe products** programmatically (Pro & Enterprise tiers)
- ✅ **Create all Stripe prices** (monthly & yearly billing)
- ✅ **Capture all IDs** and update your .env files automatically
- ✅ **Start webhook listener** and save the webhook secret

**No manual configuration needed!** Just clone, run Claude Code, type `/setup-boilerplate`, and you're ready to build.

## 🚀 Get Help & Support

- **Join our Community:** [ISS AI Automation School on Skool](https://www.skool.com/iss-ai-automation-school-6342/about)
- **Book a Call:** [Schedule 1-on-1 time with me](https://calendar.google.com/calendar/u/0/appointments/AcZssZ2oL_DgLYpW29DF7Nv7tE8v5LI5lTvh4CLDVx4=)

Need help getting started? Want to learn how to build SaaS apps with AI? Join the community or book a call!

---

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Supabase** - Authentication and database
- **Stripe** - Payment processing

## Project Structure

```
streamproject/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Utility libraries
│   ├── stripe/
│   │   ├── client.ts      # Stripe client for browser
│   │   └── server.ts      # Stripe server-side client
│   ├── supabase/
│   │   ├── client.ts      # Supabase client for browser
│   │   ├── server.ts      # Supabase server-side client
│   │   └── middleware.ts  # Supabase middleware helper
│   └── supabase.ts        # Original Supabase client (legacy)
├── types/
│   └── database.ts        # Database type definitions
├── supabase/              # Supabase configuration
│   ├── config.toml        # Local Supabase settings
│   └── migrations/        # Database migrations
├── middleware.ts          # Next.js middleware for auth
├── .env.local             # Environment variables (Next.js format)
└── .env                   # Original environment variables
```

## Environment Variables

The project uses two environment files:

### .env (Original Supabase/Stripe config)
Contains all the original Supabase and Stripe configuration.

### .env.local (Next.js format)
Contains environment variables formatted for Next.js:
- `NEXT_PUBLIC_*` variables are accessible in the browser
- Other variables are server-side only

## Getting Started

### Prerequisites

**Minimum Requirements:**
- Node.js 18+ installed
- Docker Desktop installed and running ([Download Docker](https://www.docker.com/products/docker-desktop/))
- Stripe account: [Sign up at Stripe](https://dashboard.stripe.com/register)

**Optional (auto-installed by Claude Code):**
- Supabase CLI
- Stripe CLI

> **Note:** The `/setup-boilerplate` command will automatically check for and offer to install Supabase CLI and Stripe CLI if they're missing. You can also install them manually beforehand if you prefer.

### ⚡ Ultimate Setup with Claude Code (Recommended)

**The absolute easiest way!** This boilerplate includes a custom Claude Code slash command that automates **100% of the setup**.

> **What is Claude Code?** [Claude Code](https://claude.com/claude-code) is Anthropic's AI coding assistant that can read, write, and execute code in your terminal. It's like having an expert developer pair programming with you. Get it at [claude.com/claude-code](https://claude.com/claude-code)

#### Setup in 3 Steps:

**1. Clone the Repository**
```bash
npx degit IncomeStreamSurfer/claude-code-saas-starter my-saas-app
cd my-saas-app
```

**2. Start Claude Code**
```bash
claude
```

**3. Run ONE Command**
```
/setup-boilerplate
```

**That's it!** 🎉 Claude Code will automatically:

1. ✅ Install all npm dependencies
2. ✅ Start Supabase local instance (database + auth)
3. ✅ Create `.env` and `.env.local` files
4. ✅ Populate all Supabase credentials automatically
5. ✅ Authenticate you with Stripe (opens browser)
6. ✅ **Create Pro product in Stripe with monthly & yearly prices**
7. ✅ **Create Enterprise product in Stripe with monthly & yearly prices**
8. ✅ **Capture all product IDs and price IDs**
9. ✅ **Update .env files with ALL Stripe configuration**
10. ✅ Start Stripe webhook listener
11. ✅ Capture and save webhook secret (WHSEC)
12. ✅ Verify entire setup is complete

**Total time: ~2 minutes** ⏱️

Then just run:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - **fully working SaaS ready to customize!** 🚀

**What you get:**
- Magic link authentication working
- Supabase database connected
- Stripe checkout integration ready
- Webhooks configured
- Pro & Enterprise subscription tiers created
- All environment variables set

**No manual configuration. No copying IDs. No errors.** Just working code.

---

### Quick Setup (Automated Script) ⚡

The fastest way to get started! The setup script automatically configures everything for you.

#### 1. Clone and Install

```bash
npx degit IncomeStreamSurfer/claude-code-saas-starter my-saas-app
cd my-saas-app
npm install
```

#### 2. Run Automated Setup

```bash
npm run setup
```

This interactive script will:
- ✅ Start Supabase local instance
- ✅ Fetch and populate all Supabase credentials
- ✅ Create `.env` and `.env.local` files
- ✅ Optionally set up Stripe webhook listener

#### 3. Add Your Stripe Credentials

Open `.env` and `.env.local` and add:

1. **Stripe API Keys** from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys):
   ```bash
   STRIPE_PUBLISHABLE_KEY=pk_test_your_key
   STRIPE_SECRET_KEY=sk_test_your_key
   ```

2. **Create Products & Prices** in [Stripe Products](https://dashboard.stripe.com/products):
   - Create "Pro" product with monthly & yearly prices
   - Create "Enterprise" product with monthly & yearly prices
   - Copy the product IDs (prod_xxx) and price IDs (price_xxx)
   - Add them to your `.env` files

#### 4. Start Developing

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you're ready to go! 🚀

---

### Manual Setup (Alternative)

Prefer to set things up manually? Follow this detailed guide.

#### 1. Clone and Install

```bash
npx degit IncomeStreamSurfer/claude-code-saas-starter my-saas-app
cd my-saas-app
npm install
```

#### 2. Set Up Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
cp .env.example .env.local
```

#### 3. Configure Supabase (Local Development)

Start Supabase locally:
```bash
npm run supabase:start
```

After Supabase starts, run:
```bash
supabase status -o env
```

This will output all the environment variables. Copy them to your `.env` and `.env.local` files.

**Key Supabase variables you need:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase API URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (keep secret!)

#### 4. Configure Stripe Products and Pricing

This is the most important step for customizing your SaaS pricing!

##### Step 4.1: Get Your Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API Keys**
3. Copy your **Publishable key** (starts with `pk_test_`) and **Secret key** (starts with `sk_test_`)
4. Add them to your `.env` and `.env.local` files:

```bash
# In .env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# In .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

##### Step 4.2: Create Your Products in Stripe

1. Go to [Stripe Products](https://dashboard.stripe.com/products)
2. Click **+ Add Product** for each tier (Pro and Enterprise)

**For Pro Tier:**
- Name: `Pro`
- Description: Your pro tier description
- Click **Add pricing**
  - **Monthly**: Enter your monthly price (e.g., $14.99)
    - Billing period: Monthly
    - Click **Add pricing**
    - Copy the **Price ID** (starts with `price_`)
  - Click **Add another price** for yearly
  - **Yearly**: Enter your yearly price (e.g., $143.90)
    - Billing period: Yearly
    - Click **Add pricing**
    - Copy the **Price ID** (starts with `price_`)
- Copy the **Product ID** from the top of the page (starts with `prod_`)

**For Enterprise Tier:**
- Repeat the same process with your Enterprise pricing

##### Step 4.3: Add Stripe IDs to Environment Files

Update both `.env` and `.env.local` with your Stripe IDs:

```bash
# Stripe Product IDs
STRIPE_PRODUCT_PRO=prod_YOUR_PRO_PRODUCT_ID
STRIPE_PRODUCT_ENTERPRISE=prod_YOUR_ENTERPRISE_PRODUCT_ID

# Stripe Price IDs
STRIPE_PRICE_PRO_MONTHLY=price_YOUR_PRO_MONTHLY_PRICE_ID
STRIPE_PRICE_PRO_YEARLY=price_YOUR_PRO_YEARLY_PRICE_ID
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_YOUR_ENTERPRISE_MONTHLY_PRICE_ID
STRIPE_PRICE_ENTERPRISE_YEARLY=price_YOUR_ENTERPRISE_YEARLY_PRICE_ID
```

##### Step 4.4: Update Pricing Display (Optional)

If you want to update the actual dollar amounts shown on the pricing page, edit `lib/stripe/config.ts`:

```typescript
export const PRICING = {
  pro: {
    price: {
      monthly: 1499, // $14.99 in cents
      yearly: 14390, // $143.90 in cents
    },
  },
  enterprise: {
    price: {
      monthly: 9999, // $99.99 in cents
      yearly: 95990, // $959.90 in cents
    },
  },
}
```

#### 5. Set Up Stripe Webhooks (Local Testing)

In a new terminal, run:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret (starts with `whsec_`) and add it to your environment files:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

#### 6. Customize Your App Name (Optional)

Update the app name in both `.env` and `.env.local`:
```bash
# In .env
APP_NAME=Your Amazing SaaS

# In .env.local
NEXT_PUBLIC_APP_NAME=Your Amazing SaaS
```

#### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

### Available Commands

**Claude Code Slash Commands:**
- `/setup-boilerplate` - **🤖 FULLY automated setup** (Supabase + Stripe products + all config)

**NPM Scripts:**
- `npm run setup` - **Automated setup script** (configures Supabase, creates env files)
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run supabase:start` - Start local Supabase
- `npm run supabase:stop` - Stop local Supabase
- `npm run supabase:status` - Check Supabase status

## Deploying to Production

### 1. Set Up Production Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** → **API**
3. Copy your production credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your service role key

4. Run migrations to production:
```bash
supabase link --project-ref your-project-ref
supabase db push
```

### 2. Switch Stripe to Live Mode

1. In your Stripe Dashboard, toggle to **Live mode** (top right)
2. Go to **Developers** → **API Keys**
3. Get your **live** API keys (they start with `pk_live_` and `sk_live_`)
4. Create new live products and prices (same as test mode setup)
5. Update your production environment variables with live keys and IDs

### 3. Set Up Production Webhooks

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **+ Add endpoint**
3. Enter your production URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to your production environment as `STRIPE_WEBHOOK_SECRET`

### 4. Deploy Your Application

**Vercel (Recommended):**

```bash
npm install -g vercel
vercel
```

Add all environment variables in the Vercel dashboard under **Settings** → **Environment Variables**.

**Other Platforms:**
- Make sure to set all environment variables from `.env.example`
- Ensure `NODE_ENV=production`
- Run `npm run build` before deploying

### 5. Test Your Production Setup

1. Visit your production site
2. Sign up for an account
3. Subscribe to a plan
4. Verify the subscription appears in:
   - Stripe Dashboard
   - Your Supabase database (subscriptions table)
   - User dashboard showing correct tier

## Database Schema

The database includes:

### Tables
- **profiles** - User profiles with membership tiers
- **subscriptions** - Stripe subscription data

### Enums
- `membership_tier`: 'free' | 'pro' | 'enterprise'
- `subscription_status`: 'active' | 'canceled' | 'past_due' | 'trialing' | etc.

## Supabase Integration

### Client Components
```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
```

### Server Components
```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
```

### Admin Operations (Server-side only)
```typescript
import { createAdminClient } from '@/lib/supabase/server';

const supabase = createAdminClient();
```

## Stripe Integration

### Client Components
```typescript
import { getStripe } from '@/lib/stripe/client';

const stripe = await getStripe();
```

### Server Components
```typescript
import { stripe } from '@/lib/stripe/server';

const session = await stripe.checkout.sessions.create({...});
```

## Features Included

- Magic link authentication (passwordless)
- Protected routes with middleware
- User profiles with membership tiers
- Subscription management (Free, Pro, Enterprise)
- Stripe Checkout integration
- Stripe Customer Portal for subscription management
- Webhook handling for subscription updates
- Automatic tier upgrades/downgrades
- Server-side rendering with Next.js App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Dark mode support

## Environment Variables Reference

### Required Variables

```bash
# App Configuration
NEXT_PUBLIC_APP_NAME=Your App Name

# Supabase (Public)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase (Server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Stripe (Public)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_or_pk_live

# Stripe (Server-side only)
STRIPE_SECRET_KEY=sk_test_or_sk_live
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Product IDs
STRIPE_PRODUCT_PRO=prod_xxxxx
STRIPE_PRODUCT_ENTERPRISE=prod_xxxxx

# Stripe Price IDs
STRIPE_PRICE_PRO_MONTHLY=price_xxxxx
STRIPE_PRICE_PRO_YEARLY=price_xxxxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxxxx
STRIPE_PRICE_ENTERPRISE_YEARLY=price_xxxxx
```

## Troubleshooting

### "Missing required environment variable" Error

**Problem:** You see an error about missing Stripe environment variables.

**Solution:**
1. Make sure all 6 Stripe price IDs are set in your `.env` file
2. Restart your development server after updating `.env`
3. Verify the variable names match exactly (case-sensitive)

### Stripe Checkout Not Working

**Problem:** Clicking "Subscribe" doesn't redirect to Stripe.

**Solution:**
1. Check browser console for errors
2. Verify your Stripe publishable key is correct
3. Make sure the price IDs match your Stripe Dashboard
4. Ensure you're using test mode keys for development

### Webhooks Not Firing Locally

**Problem:** Subscriptions not updating in database.

**Solution:**
1. Make sure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Copy the webhook secret from the CLI output
3. Update `STRIPE_WEBHOOK_SECRET` in your `.env` files
4. Restart your dev server

### Authentication Not Working

**Problem:** Magic link emails not arriving.

**Solution:**
1. For local development, check Mailpit at http://127.0.0.1:54344
2. Emails are NOT sent in local mode - use Mailpit
3. For production, configure email in Supabase Dashboard → Authentication → Email Templates

### Database Migrations Not Running

**Problem:** Tables don't exist in database.

**Solution:**
```bash
# For local development
supabase db reset

# For production
supabase link --project-ref your-project-ref
supabase db push
```

## Customization Guide

### Changing Pricing Tiers

1. **Update pricing display** in `lib/stripe/config.ts` (PRICING object)
2. **Update feature lists** in `lib/stripe/config.ts` (PRICING features array)
3. **Create matching products/prices** in Stripe Dashboard
4. **Update environment variables** with new price IDs

### Adding a New Tier

1. Create the product in Stripe Dashboard
2. Add product/price IDs to environment variables
3. Update `lib/stripe/config.ts` to include the new tier
4. Update database enum in migration file to include new tier
5. Update TypeScript types in `types/database.ts`

### Changing the Free Tier Features

Edit `lib/stripe/config.ts`:
```typescript
free: {
  features: [
    'Your custom feature 1',
    'Your custom feature 2',
    // Add more features...
  ],
}
```

## Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Notes

- The `.env` file is preserved from the original setup
- The `.env.local` file uses Next.js naming conventions
- Both Supabase clients (legacy and SSR) are available
- Middleware automatically refreshes auth sessions

# Loftly Apartment

Premium vacation rental booking platform for luxury apartments in Berlin.

## Features

- **Multi-language Support** - German and English (i18n)
- **Property Listings** - Browse luxury apartments with detailed galleries
- **Real-time Availability** - Calendar synced with Guesty
- **Secure Payments** - Stripe integration for seamless checkout
- **Responsive Design** - Optimized for all devices

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Property Management**: Guesty API
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see `.env.example`)
4. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GUESTY_CLIENT_ID`
- `GUESTY_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## License

Proprietary - All rights reserved.

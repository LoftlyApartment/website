import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { BookingSearchBar } from '@/components/home/BookingSearchBar';
import { FeaturedProperties } from '@/components/home/FeaturedProperties';
import { TargetAudienceSection } from '@/components/home/TargetAudienceSection';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { BerlinHighlights } from '@/components/home/BerlinHighlights';
import { NewsletterSignup } from '@/components/home/NewsletterSignup';
import { TrustIndicators } from '@/components/home/TrustIndicators';

export const metadata: Metadata = {
  title: 'Premium Apartments in Berlin | Loftly Apartment GmbH',
  description: 'Discover luxury serviced apartments in Berlin. Perfect for business travelers, families, and hospital visitors. Licensed property management with 24/7 support. Book directly for the best rates.',
  keywords: [
    'Berlin apartments',
    'serviced apartments Berlin',
    'vacation rentals Berlin',
    'business apartments Berlin',
    'family apartments Berlin',
    'Kantstrasse apartment',
    'Hindenburgdamm apartment',
    'furnished apartments Berlin',
    'short-term rental Berlin',
    'luxury apartments Berlin'
  ],
  openGraph: {
    title: 'Premium Apartments in Berlin | Loftly Apartment GmbH',
    description: 'Experience luxury living in Berlin\'s finest neighborhoods. Professional management, prime locations, 24/7 support.',
    type: 'website',
    locale: 'de_DE',
    alternateLocale: 'en_US',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen -mt-20 md:-mt-24">
      <HeroSection />
      <BookingSearchBar />
      <FeaturedProperties />
      <TargetAudienceSection />
      <WhyChooseUs />
      <BerlinHighlights />
      <NewsletterSignup />
      <TrustIndicators />
    </div>
  );
}

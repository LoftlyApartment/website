'use client';

import { useTranslations } from 'next-intl';
import { FAQCategory } from '@/components/faq/FAQCategory';
import { FAQAccordion } from '@/components/faq/FAQAccordion';
import {
  CalendarIcon,
  HomeIcon,
  ClockIcon,
  HeadphonesIcon,
  MapPinIcon,
  BookIcon,
} from '@/components/ui/Icons';

export default function FAQPage() {
  const t = useTranslations('faq');

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 -z-10" />
        <div className="absolute inset-0 opacity-10 -z-10" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '48px 48px'
        }} />

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-primary-50">
              {t('hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-8">

            {/* Booking & Reservations */}
            <FAQCategory
              title={t('booking.title')}
              icon={<CalendarIcon size={24} className="text-white" />}
            >
              <FAQAccordion
                question={t('booking.q1.question')}
                answer={t('booking.q1.answer')}
              />
              <FAQAccordion
                question={t('booking.q2.question')}
                answer={t('booking.q2.answer')}
              />
              <FAQAccordion
                question={t('booking.q3.question')}
                answer={t('booking.q3.answer')}
              />
              <FAQAccordion
                question={t('booking.q4.question')}
                answer={t('booking.q4.answer')}
              />
            </FAQCategory>

            {/* Property & Amenities */}
            <FAQCategory
              title={t('property.title')}
              icon={<HomeIcon size={24} className="text-white" />}
            >
              <FAQAccordion
                question={t('property.q1.question')}
                answer={t('property.q1.answer')}
              />
              <FAQAccordion
                question={t('property.q2.question')}
                answer={t('property.q2.answer')}
              />
              <FAQAccordion
                question={t('property.q3.question')}
                answer={t('property.q3.answer')}
              />
            </FAQCategory>

            {/* Check-in & Check-out */}
            <FAQCategory
              title={t('checkin.title')}
              icon={<ClockIcon size={24} className="text-white" />}
            >
              <FAQAccordion
                question={t('checkin.q1.question')}
                answer={t('checkin.q1.answer')}
              />
              <FAQAccordion
                question={t('checkin.q2.question')}
                answer={t('checkin.q2.answer')}
              />
              <FAQAccordion
                question={t('checkin.q3.question')}
                answer={t('checkin.q3.answer')}
              />
            </FAQCategory>

            {/* During Your Stay */}
            <FAQCategory
              title={t('stay.title')}
              icon={<HeadphonesIcon size={24} className="text-white" />}
            >
              <FAQAccordion
                question={t('stay.q1.question')}
                answer={t('stay.q1.answer')}
              />
              <FAQAccordion
                question={t('stay.q2.question')}
                answer={t('stay.q2.answer')}
              />
              <FAQAccordion
                question={t('stay.q3.question')}
                answer={t('stay.q3.answer')}
              />
            </FAQCategory>

            {/* Location & Transport */}
            <FAQCategory
              title={t('location.title')}
              icon={<MapPinIcon size={24} className="text-white" />}
            >
              <FAQAccordion
                question={t('location.q1.question')}
                answer={t('location.q1.answer')}
              />
              <FAQAccordion
                question={t('location.q2.question')}
                answer={t('location.q2.answer')}
              />
            </FAQCategory>

            {/* Policies */}
            <FAQCategory
              title={t('policies.title')}
              icon={<BookIcon size={24} className="text-white" />}
            >
              <FAQAccordion
                question={t('policies.q1.question')}
                answer={t('policies.q1.answer')}
              />
              <FAQAccordion
                question={t('policies.q2.question')}
                answer={t('policies.q2.answer')}
              />
              <FAQAccordion
                question={t('policies.q3.question')}
                answer={t('policies.q3.answer')}
              />
            </FAQCategory>

          </div>
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Still have questions?
            </h2>
            <p className="text-lg text-neutral-600 mb-8">
              Contact us and we'll be happy to help!
            </p>
            <a
              href="/contact"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-medium hover:shadow-large"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

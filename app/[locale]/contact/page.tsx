'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ContactForm } from '@/components/contact/ContactForm';
import { ContactInfoCard } from '@/components/contact/ContactInfoCard';
import { Card, CardContent } from '@/components/ui/Card';
import { BuildingIcon, MailIcon, PhoneIcon } from '@/components/ui/Icons';

export default function ContactPage() {
  const t = useTranslations();

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
              {t('contact.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-primary-50">
              {t('contact.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <ContactInfoCard
              icon={<BuildingIcon size={32} className="text-primary-600" />}
              title={t('contact.info.address.title')}
              line1={t('contact.info.address.line1')}
              line2={t('contact.info.address.line2')}
            />

            <ContactInfoCard
              icon={<MailIcon size={32} className="text-primary-600" />}
              title={t('contact.info.email.title')}
              line1={t('contact.info.email.address')}
              line2={t('contact.info.email.response')}
            />

            <ContactInfoCard
              icon={<PhoneIcon size={32} className="text-primary-600" />}
              title={t('contact.info.phone.title')}
              line1={t('contact.info.phone.number')}
              line2={t('contact.info.phone.hours')}
              line3={t('contact.info.phone.emergency')}
            />
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                {t('contact.form.title')}
              </h2>
            </div>

            <Card variant="elevated" padding="lg">
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Link Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
              {t('contact.faqLink.title')}
            </h3>
            <Link
              href="/faq"
              className="text-primary-600 hover:text-primary-700 font-medium text-lg underline"
            >
              {t('contact.faqLink.link')}
            </Link>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-8 text-center">
              {t('contact.map.title')}
            </h2>

            {/* Map Placeholder */}
            <div className="relative h-96 rounded-xl overflow-hidden shadow-large">
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                <div className="text-center">
                  <BuildingIcon size={48} className="text-neutral-500 mx-auto mb-4" />
                  <p className="text-neutral-600 font-medium">
                    {t('contact.info.address.line1')}
                  </p>
                  <p className="text-neutral-600">
                    {t('contact.info.address.line2')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

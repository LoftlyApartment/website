'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { AwardIcon, ShieldIcon, MapPinIcon, CheckIcon, UsersIcon } from '@/components/ui/Icons';

export default function AboutPage() {
  const t = useTranslations('about');

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

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6 text-center">
              {t('story.title')}
            </h2>
            <p className="text-lg text-neutral-700 leading-relaxed text-center">
              {t('story.content')}
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-12 text-center">
            {t('values.title')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Quality */}
            <Card variant="elevated" padding="lg" hover className="text-center">
              <CardContent>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                    <AwardIcon size={32} className="text-primary-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  {t('values.quality.title')}
                </h3>
                <p className="text-neutral-600">
                  {t('values.quality.description')}
                </p>
              </CardContent>
            </Card>

            {/* Trust */}
            <Card variant="elevated" padding="lg" hover className="text-center">
              <CardContent>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center">
                    <ShieldIcon size={32} className="text-secondary-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  {t('values.trust.title')}
                </h3>
                <p className="text-neutral-600">
                  {t('values.trust.description')}
                </p>
              </CardContent>
            </Card>

            {/* Location */}
            <Card variant="elevated" padding="lg" hover className="text-center">
              <CardContent>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                    <MapPinIcon size={32} className="text-primary-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  {t('values.location.title')}
                </h3>
                <p className="text-neutral-600">
                  {t('values.location.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-12 text-center">
              {t('why.title')}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <CheckIcon size={24} className="text-primary-600 flex-shrink-0 mt-1" />
                <p className="text-neutral-700">{t('why.items.professional')}</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckIcon size={24} className="text-primary-600 flex-shrink-0 mt-1" />
                <p className="text-neutral-700">{t('why.items.licensed')}</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckIcon size={24} className="text-primary-600 flex-shrink-0 mt-1" />
                <p className="text-neutral-700">{t('why.items.direct')}</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckIcon size={24} className="text-primary-600 flex-shrink-0 mt-1" />
                <p className="text-neutral-700">{t('why.items.support')}</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckIcon size={24} className="text-primary-600 flex-shrink-0 mt-1" />
                <p className="text-neutral-700">{t('why.items.petFriendly')}</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckIcon size={24} className="text-primary-600 flex-shrink-0 mt-1" />
                <p className="text-neutral-700">{t('why.items.flexible')}</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckIcon size={24} className="text-primary-600 flex-shrink-0 mt-1" />
                <p className="text-neutral-700">{t('why.items.multilingual')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-b from-neutral-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center">
                  <UsersIcon size={40} className="text-white" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                {t('team.title')}
              </h2>
              <p className="text-lg text-neutral-600 mb-2">
                {t('team.representatives')}
              </p>
              <p className="text-neutral-700 leading-relaxed">
                {t('team.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {t('cta.title')}
            </h2>
            <Link href="/booking">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4 shadow-xl hover:shadow-2xl">
                {t('cta.button')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

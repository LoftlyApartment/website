'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ChevronRightIcon } from '@/components/ui/Icons';

export default function BlogPage() {
  const t = useTranslations();
  const locale = useLocale();

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
              {t('nav.blog')}
            </h1>
            <p className="text-xl md:text-2xl text-primary-50">
              {locale === 'de'
                ? 'Tipps, Neuigkeiten und Geschichten aus Berlin'
                : 'Tips, news, and stories from Berlin'}
            </p>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-medium p-12">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                {locale === 'de' ? 'Bald verfügbar' : 'Coming Soon'}
              </h2>
              <p className="text-lg text-neutral-600 mb-8">
                {locale === 'de'
                  ? 'Wir arbeiten an spannenden Inhalten für Sie. Schauen Sie bald wieder vorbei!'
                  : 'We\'re working on exciting content for you. Check back soon!'}
              </p>
              <Link
                href={`/${locale}/properties`}
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                {t('nav.properties')}
                <ChevronRightIcon size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

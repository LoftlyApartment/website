import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CookieConsent } from '@/components/gdpr/CookieConsent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Loftly Apartment GmbH',
    template: '%s | Loftly Apartment GmbH',
  },
  description: 'Premium apartments for your perfect stay',
  keywords: ['apartments', 'vacation rental', 'accommodation', 'lodging'],
  authors: [{ name: 'Loftly Apartment GmbH' }],
  creator: 'Loftly Apartment GmbH',
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://loftly.com',
    siteName: 'Loftly Apartment GmbH',
    title: 'Loftly Apartment GmbH',
    description: 'Premium apartments for your perfect stay',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loftly Apartment GmbH',
    description: 'Premium apartments for your perfect stay',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 pt-20 md:pt-24">
          {children}
        </main>
        <Footer />
      </div>
      <CookieConsent />
    </NextIntlClientProvider>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

// Shimmer effect for blur placeholder
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f5f0e8" offset="20%" />
      <stop stop-color="#e8dcc8" offset="50%" />
      <stop stop-color="#f5f0e8" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f5f0e8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

export const BerlinHighlights = () => {
  const t = useTranslations('home.berlin');

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <Card variant="elevated" padding="lg">
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left: Image Placeholder */}
                <div className="relative h-96 rounded-xl shadow-lg bg-luxury-cream-100 border-2 border-luxury-beige-300 overflow-hidden">
                  <Image
                    src="/images/berlin-highlights.jpg"
                    alt="Berlin highlights"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                    quality={80}
                    placeholder="blur"
                    blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                    className="object-cover"
                  />
                </div>

                {/* Right: Content */}
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                    {t('title')}
                  </h2>

                  <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                    {t('description')}
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary-600" />
                      </div>
                      <p className="text-neutral-700">{t('highlight1')}</p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary-600" />
                      </div>
                      <p className="text-neutral-700">{t('highlight2')}</p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary-600" />
                      </div>
                      <p className="text-neutral-700">{t('highlight3')}</p>
                    </div>
                  </div>

                  <Link href="/properties">
                    <Button size="lg" variant="primary">
                      {t('cta')}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

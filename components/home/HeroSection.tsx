'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { MousePointerIcon } from '@/components/ui/Icons';
import Link from 'next/link';
import Image from 'next/image';
import heroImage from '@/public/images/kantstrasse/kitchen-01.jpg';

export const HeroSection = () => {
  const t = useTranslations('home.hero');

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={heroImage}
          alt="Lofty Living Berlin - Luxury apartment kitchen"
          fill
          priority
          placeholder="blur"
          quality={85}
          className="object-cover"
        />
        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {t('title')}
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-primary-50 mb-10 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/booking">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4 shadow-xl hover:shadow-2xl">
                {t('cta')}
              </Button>
            </Link>
            <Link href="/properties">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 bg-white/10 text-white border-white hover:bg-white/20">
                {t('viewProperties')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center text-white/80 gap-2">
            <span className="text-sm">{t('scrollDown')}</span>
            <MousePointerIcon size={24} className="rotate-90" />
          </div>
        </div>
      </div>
    </section>
  );
};

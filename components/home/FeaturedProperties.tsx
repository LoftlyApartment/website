'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { WifiIcon, MaximizeIcon, MapPinIcon, PawIcon, HomeIcon } from '@/components/ui/Icons';

// Shimmer effect for loading placeholder
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="${w}" height="${h}" fill="#e2e8f0"/>
  <rect id="r" width="${w}" height="${h}" fill="url(#g)"/>
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"/>
  <defs>
    <linearGradient id="g">
      <stop stop-color="#e2e8f0" offset="20%" />
      <stop stop-color="#f8fafc" offset="50%" />
      <stop stop-color="#e2e8f0" offset="70%" />
    </linearGradient>
  </defs>
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

export const FeaturedProperties = () => {
  const t = useTranslations('home.properties');

  const properties = [
    {
      id: 'kantstrasse',
      name: t('kant.name'),
      address: t('kant.address'),
      size: t('kant.size'),
      guests: t('kant.guests'),
      price: t('kant.price'),
      image: '/images/kantstrasse/bedroom1-main.jpg',
      features: [
        { icon: <WifiIcon size={16} />, label: t('features.wifi') },
        { icon: <MaximizeIcon size={16} />, label: t('kant.workspace') },
      ],
      badges: [t('kant.size'), t('kant.guests')]
    },
    {
      id: 'hindenburgdamm',
      name: t('hinden.name'),
      address: t('hinden.address'),
      size: t('hinden.size'),
      guests: t('hinden.guests'),
      price: t('hinden.price'),
      image: '/images/hindenburgdamm/bedroom1-main.jpg',
      features: [
        { icon: <WifiIcon size={16} />, label: t('features.wifi') },
        { icon: <PawIcon size={16} />, label: t('hinden.petFriendly') },
      ],
      badges: [t('hinden.size'), t('hinden.guests')]
    },
    {
      id: 'kottbusserdamm',
      name: t('kotti.name'),
      address: t('kotti.address'),
      size: t('kotti.size'),
      guests: t('kotti.guests'),
      price: t('kotti.price'),
      image: '/images/kottbusserdamm/bedroom1-main.jpg',
      features: [
        { icon: <PawIcon size={16} />, label: t('kotti.petFriendly') },
        { icon: <HomeIcon size={16} />, label: t('kotti.garden') },
      ],
      badges: [t('kotti.size'), t('kotti.guests')]
    }
  ];

  return (
    <section className="py-20 bg-neutral-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {properties.map((property) => (
            <Card key={property.id} variant="elevated" padding="none" hover className="overflow-hidden">
              {/* Property Image */}
              <div className="h-64 w-full relative overflow-hidden bg-luxury-cream-100">
                <Image
                  src={property.image}
                  alt={property.name}
                  fill
                  className="object-cover"
                  quality={75}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  placeholder="blur"
                  blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                />
                {/* Overlay with Location */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <div className="flex items-center gap-2 text-white drop-shadow-lg">
                    <MapPinIcon size={20} />
                    <span className="font-medium">{property.address}</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Property Name */}
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  {property.name}
                </h3>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.badges.map((badge, index) => (
                    <Badge key={index} variant="primary" size="sm">
                      {badge}
                    </Badge>
                  ))}
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-4 mb-4">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-neutral-600">
                      {feature.icon}
                      <span className="text-sm">{feature.label}</span>
                    </div>
                  ))}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-primary-600">{property.price}</span>
                  <span className="text-neutral-600">/ {t('perNight')}</span>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Link href={`/properties/${property.id}`} className="w-full">
                  <Button fullWidth size="lg" variant="primary">
                    {t('viewDetails')}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link href="/properties">
            <Button variant="outline" size="lg">
              {t('viewAll')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

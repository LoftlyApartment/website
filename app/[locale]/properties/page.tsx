import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { WifiIcon, MaximizeIcon, MapPinIcon, PawIcon, UsersIcon } from '@/components/ui/Icons';
import { getAllProperties } from '@/lib/data/properties';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'properties' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    keywords: ['Berlin apartments', 'serviced apartments', 'vacation rentals', 'Kantstrasse', 'Hindenburgdamm'],
  };
}

// Shimmer effect for image placeholder
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
  typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str);

export default function PropertiesPage() {
  const t = useTranslations('properties');
  const properties = getAllProperties();

  return (
    <main className="min-h-screen py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Filter Section (Placeholder) */}
        <div className="mb-8 bg-white rounded-xl shadow-medium p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t('filters.priceRange')}
              </label>
              <select className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option>{t('filters.anyPrice')}</option>
                <option>€0 - €100</option>
                <option>€100 - €150</option>
                <option>€150+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t('filters.guests')}
              </label>
              <select className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option>{t('filters.anyGuests')}</option>
                <option>1-2 {t('filters.guestsLabel')}</option>
                <option>3-4 {t('filters.guestsLabel')}</option>
                <option>5+ {t('filters.guestsLabel')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t('filters.amenities')}
              </label>
              <select className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option>{t('filters.allAmenities')}</option>
                <option>{t('filters.workspace')}</option>
                <option>{t('filters.petFriendly')}</option>
                <option>{t('filters.parking')}</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="primary" size="md" fullWidth>
                {t('filters.apply')}
              </Button>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {properties.map((property) => (
            <Card key={property.id} variant="elevated" padding="none" hover className="overflow-hidden">
              {/* Property Image */}
              <div className="h-64 w-full relative overflow-hidden bg-luxury-cream-100">
                <Image
                  src={property.images[0]}
                  alt={property.name}
                  fill
                  className="object-cover"
                  quality={75}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  placeholder="blur"
                  blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                />
                {/* Overlay with Location */}
                <div className="absolute bottom-4 left-4 right-4">
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
                  <Badge variant="primary" size="sm">
                    {property.size}m²
                  </Badge>
                  <Badge variant="primary" size="sm">
                    {property.maxGuests} {t('card.guests')}
                  </Badge>
                  {property.petFriendly && (
                    <Badge variant="secondary" size="sm">
                      {t('card.petFriendly')}
                    </Badge>
                  )}
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2 text-neutral-600">
                    <WifiIcon size={16} />
                    <span className="text-sm">{t('card.wifi')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <MaximizeIcon size={16} />
                    <span className="text-sm">{property.size}m²</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <UsersIcon size={16} />
                    <span className="text-sm">{property.maxGuests} {t('card.guests')}</span>
                  </div>
                  {property.petFriendly && (
                    <div className="flex items-center gap-2 text-neutral-600">
                      <PawIcon size={16} />
                      <span className="text-sm">{t('card.petFriendly')}</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-primary-600">€{property.basePrice}</span>
                  <span className="text-neutral-600">/ {t('card.perNight')}</span>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Link href={`/properties/${property.slug}`} className="w-full">
                  <Button fullWidth size="lg" variant="primary">
                    {t('card.viewDetails')}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}

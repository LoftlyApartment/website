import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPropertyBySlug, getAllProperties } from '@/lib/data/properties';
import { PropertyGallery } from '@/components/property/PropertyGallery';
import { PropertyHeader } from '@/components/property/PropertyHeader';
import { PropertyInfo } from '@/components/property/PropertyInfo';
import { PropertyDescription } from '@/components/property/PropertyDescription';
import { PropertyAmenities } from '@/components/property/PropertyAmenities';
import { PropertyCalendar } from '@/components/property/PropertyCalendar';
import { PropertyLocation } from '@/components/property/PropertyLocation';
import { PropertyRules } from '@/components/property/PropertyRules';
import { PropertyReviews } from '@/components/property/PropertyReviews';
import { BookingWidget } from '@/components/property/BookingWidget';

interface PropertyPageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export async function generateStaticParams() {
  const properties = getAllProperties();
  const locales = ['de', 'en'];

  return locales.flatMap((locale) =>
    properties.map((property) => ({
      locale,
      slug: property.slug,
    }))
  );
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    return {
      title: 'Property Not Found',
    };
  }

  return {
    title: `${property.name} - ${property.address} | Loftly Apartment GmbH`,
    description: property.description.text,
    keywords: [
      'Berlin apartment',
      property.name,
      property.address,
      'vacation rental',
      'serviced apartment',
      ...(property.petFriendly ? ['pet-friendly'] : []),
    ],
    openGraph: {
      title: property.name,
      description: property.description.text,
      type: 'website',
    },
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug, locale } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return (
    <div className="min-h-screen pb-8 md:pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <PropertyHeader
            name={property.name}
            address={property.address}
            rating={property.rating}
            reviewCount={property.reviewCount}
          />
        </div>

        {/* Gallery */}
        <div className="mb-12">
          <PropertyGallery images={property.images} propertyName={property.name} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Quick Info */}
            <PropertyInfo
              size={property.size}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              maxGuests={property.maxGuests}
              checkInTime={property.checkInTime}
              checkOutTime={property.checkOutTime}
            />

            {/* Description */}
            <PropertyDescription
              title={property.description.title}
              text={property.description.text}
            />

            {/* Amenities */}
            <PropertyAmenities amenities={property.amenities} />

            {/* Calendar */}
            <PropertyCalendar propertyId={property.id} locale={locale} />

            {/* Location */}
            <PropertyLocation
              address={property.address}
              nearbyPlaces={property.nearbyPlaces}
            />

            {/* House Rules */}
            <PropertyRules
              checkInTime={property.checkInTime}
              checkOutTime={property.checkOutTime}
              quietHoursStart={property.quietHoursStart}
              quietHoursEnd={property.quietHoursEnd}
              smokingAllowed={property.smokingAllowed}
              partiesAllowed={property.partiesAllowed}
              petFriendly={property.petFriendly}
              maxGuests={property.maxGuests}
              petFee={property.petFee}
            />

            {/* Reviews */}
            <PropertyReviews
              reviews={property.reviews}
              rating={property.rating}
              reviewCount={property.reviewCount}
            />
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <BookingWidget
              propertyId={property.id}
              basePrice={property.basePrice}
              cleaningFee={property.cleaningFee}
              minStay={property.minStay}
              maxGuests={property.maxGuests}
              locale={locale}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

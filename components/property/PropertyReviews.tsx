'use client';

import { useTranslations } from 'next-intl';
import { StarIcon, UserIcon } from '@/components/ui/Icons';
import { Card, CardContent } from '@/components/ui/Card';
import type { PropertyReview } from '@/lib/data/properties';

interface PropertyReviewsProps {
  reviews: PropertyReview[];
  rating: number;
  reviewCount: number;
}

export const PropertyReviews: React.FC<PropertyReviewsProps> = ({
  reviews,
  rating,
  reviewCount,
}) => {
  const t = useTranslations('property.reviews');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
          {t('title')}
        </h2>
        <div className="flex items-center gap-2">
          <StarIcon size={24} className="text-yellow-500 fill-yellow-500" />
          <span className="text-2xl font-bold text-neutral-900">{rating}</span>
          <span className="text-neutral-600">({reviewCount} {t('reviewsCount')})</span>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review) => (
          <Card key={review.id} variant="elevated" padding="md">
            <CardContent>
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <UserIcon size={24} className="text-primary-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900">{review.author}</div>
                    <div className="text-sm text-neutral-600">{review.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, index) => (
                    <StarIcon
                      key={index}
                      size={16}
                      className={
                        index < review.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-neutral-300'
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Review Content */}
              <p className="text-neutral-700 mb-3 leading-relaxed">{review.content}</p>

              {/* Review Date */}
              <div className="text-sm text-neutral-500">{formatDate(review.date)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Show More Reviews (placeholder) */}
      {reviewCount > reviews.length && (
        <div className="text-center">
          <button className="text-primary-600 hover:text-primary-700 font-semibold underline">
            {t('showMore')} ({reviewCount - reviews.length} {t('more')})
          </button>
        </div>
      )}
    </div>
  );
};

'use client';

import { useTranslations } from 'next-intl';
import { ShieldIcon, CheckIcon, StarIcon, InfoIcon } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/Badge';

export const TrustIndicators = () => {
  const t = useTranslations('home.trust');

  const indicators = [
    {
      icon: <ShieldIcon size={24} />,
      label: t('licensed'),
      variant: 'primary' as const
    },
    {
      icon: <CheckIcon size={24} />,
      label: t('gdpr'),
      variant: 'success' as const
    },
    {
      icon: <InfoIcon size={24} />,
      label: t('secure'),
      variant: 'info' as const
    },
    {
      icon: <StarIcon size={24} />,
      label: t('reviews'),
      variant: 'warning' as const
    }
  ];

  return (
    <section className="py-12 bg-neutral-50 border-t border-neutral-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-6">
          {indicators.map((indicator, index) => (
            <Badge
              key={index}
              variant={indicator.variant}
              size="lg"
              icon={indicator.icon}
              className="px-6 py-3 text-base shadow-sm"
            >
              {indicator.label}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
};

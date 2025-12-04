'use client';

import { useTranslations } from 'next-intl';
import { MapPinIcon, ShieldIcon, HeadphonesIcon, StarIcon } from '@/components/ui/Icons';

export const WhyChooseUs = () => {
  const t = useTranslations('home.why');

  const features = [
    {
      icon: <MapPinIcon size={32} />,
      title: t('location.title'),
      description: t('location.description'),
      color: 'bg-primary-100 text-primary-600'
    },
    {
      icon: <ShieldIcon size={32} />,
      title: t('professional.title'),
      description: t('professional.description'),
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: <HeadphonesIcon size={32} />,
      title: t('support.title'),
      description: t('support.description'),
      color: 'bg-secondary-100 text-secondary-600'
    },
    {
      icon: <StarIcon size={32} />,
      title: t('direct.title'),
      description: t('direct.description'),
      color: 'bg-yellow-100 text-yellow-600'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${feature.color} mb-6 shadow-md`}>
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-neutral-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

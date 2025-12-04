'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/Card';
import { BriefcaseIcon, HeartIcon, PlusIcon } from '@/components/ui/Icons';

export const TargetAudienceSection = () => {
  const t = useTranslations('home.audience');

  const audiences = [
    {
      icon: <BriefcaseIcon size={40} />,
      title: t('business.title'),
      description: t('business.description'),
      color: 'text-primary-600'
    },
    {
      icon: <HeartIcon size={40} />,
      title: t('families.title'),
      description: t('families.description'),
      color: 'text-secondary-600'
    },
    {
      icon: <PlusIcon size={40} />,
      title: t('hospital.title'),
      description: t('hospital.description'),
      color: 'text-green-600'
    }
  ];

  return (
    <section className="py-20 bg-white">
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

        {/* Audience Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {audiences.map((audience, index) => (
            <Card key={index} variant="outlined" padding="lg" hover className="text-center">
              <CardContent>
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-100 mb-6 ${audience.color}`}>
                  {audience.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                  {audience.title}
                </h3>

                {/* Description */}
                <p className="text-neutral-600 leading-relaxed">
                  {audience.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

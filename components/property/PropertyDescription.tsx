'use client';

import { useTranslations } from 'next-intl';

interface PropertyDescriptionProps {
  title: string;
  text: string;
}

export const PropertyDescription: React.FC<PropertyDescriptionProps> = ({ title, text }) => {
  const t = useTranslations('property.description');

  return (
    <div className="space-y-4">
      <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
        {t('title')}
      </h2>
      <h3 className="text-xl font-semibold text-neutral-800">
        {title}
      </h3>
      <p className="text-lg text-neutral-700 leading-relaxed">
        {text}
      </p>
    </div>
  );
};

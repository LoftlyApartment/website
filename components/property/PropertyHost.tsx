'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ShieldIcon, HeadphonesIcon, CheckIcon } from '@/components/ui/Icons';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface PropertyHostProps {
  responseTime: string;
}

export const PropertyHost: React.FC<PropertyHostProps> = ({ responseTime }) => {
  const t = useTranslations('property.host');

  const features = [
    {
      icon: <HeadphonesIcon size={20} />,
      label: t('feature1'),
    },
    {
      icon: <ShieldIcon size={20} />,
      label: t('feature2'),
    },
    {
      icon: <CheckIcon size={20} />,
      label: t('feature3'),
    },
  ];

  return (
    <Card variant="elevated" padding="md">
      <CardContent>
        <div className="space-y-6">
          {/* Host Info */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-600">L</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">
              {t('name')}
            </h3>
            <p className="text-neutral-600">{t('subtitle')}</p>
          </div>

          {/* Response Time */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-center">
            <div className="text-sm text-neutral-600 mb-1">{t('responseTime')}</div>
            <div className="text-lg font-bold text-neutral-900">{responseTime}</div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-neutral-700">
                <div className="text-primary-600">{feature.icon}</div>
                <span>{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Contact Button */}
          <Link href="/contact" className="block">
            <Button variant="primary" size="lg" fullWidth>
              {t('contactButton')}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

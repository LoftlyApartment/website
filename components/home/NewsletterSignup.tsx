'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MailIcon } from '@/components/ui/Icons';
import { Card, CardContent } from '@/components/ui/Card';

export const NewsletterSignup = () => {
  const t = useTranslations('home.newsletter');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Card variant="elevated" padding="lg" className="bg-white/95 backdrop-blur-sm">
            <CardContent className="text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-6">
                <MailIcon size={32} className="text-primary-600" />
              </div>

              {/* Title */}
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                {t('title')}
              </h2>

              {/* Description */}
              <p className="text-lg text-neutral-600 mb-8">
                {t('description')}
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder={t('placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                    icon={<MailIcon size={18} />}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  loading={status === 'loading'}
                  disabled={status === 'loading' || !email}
                >
                  {t('button')}
                </Button>
              </form>

              {/* Success Message */}
              {status === 'success' && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-green-700 font-medium">{t('success')}</p>
                </div>
              )}

              {/* Privacy Notice */}
              <p className="text-sm text-neutral-500 mt-6">
                {t('privacy')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

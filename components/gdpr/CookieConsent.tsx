'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { CookiePreferences } from './CookiePreferences';
import { useCookieConsent } from '@/lib/hooks/useCookieConsent';
import { CookieIcon } from '@/components/ui/Icons';

export const CookieConsent: React.FC = () => {
  const t = useTranslations('cookie.banner');
  const {
    showBanner,
    acceptAll,
    rejectNonEssential,
    updatePreferences,
    isClient,
  } = useCookieConsent();

  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    // Delay showing banner slightly for smooth animation
    if (showBanner && isClient) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [showBanner, isClient]);

  // Don't render on server or if banner shouldn't show
  if (!isClient || !showBanner) {
    return null;
  }

  return (
    <>
      {/* Cookie Banner */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
      >
        {/* Backdrop blur overlay */}
        <div className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm" />

        {/* Banner content */}
        <div className="relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Cookie Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                    <CookieIcon className="w-6 h-6 text-primary-600" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h2
                    id="cookie-consent-title"
                    className="text-lg sm:text-xl font-semibold text-neutral-900 mb-1"
                  >
                    {t('title')}
                  </h2>
                  <p
                    id="cookie-consent-description"
                    className="text-sm text-neutral-600"
                  >
                    {t('description')}{' '}
                    <a
                      href="/cookie-policy"
                      className="text-primary-600 hover:text-primary-700 underline"
                    >
                      {t('learnMore')}
                    </a>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:flex-shrink-0">
                  <Button
                    onClick={acceptAll}
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto whitespace-nowrap"
                  >
                    {t('acceptAll')}
                  </Button>
                  <Button
                    onClick={rejectNonEssential}
                    variant="outline"
                    size="md"
                    className="w-full sm:w-auto whitespace-nowrap"
                  >
                    {t('rejectNonEssential')}
                  </Button>
                  <Button
                    onClick={() => setShowPreferences(true)}
                    variant="ghost"
                    size="md"
                    className="w-full sm:w-auto whitespace-nowrap"
                  >
                    {t('customize')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Preferences Modal */}
      <CookiePreferences
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        onSave={updatePreferences}
        onAcceptAll={acceptAll}
      />
    </>
  );
};

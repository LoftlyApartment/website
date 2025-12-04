'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { getCookieConsent } from '@/lib/utils/cookies';

interface CookiePreferencesProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: {
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
  }) => void;
  onAcceptAll: () => void;
}

export const CookiePreferences: React.FC<CookiePreferencesProps> = ({
  isOpen,
  onClose,
  onSave,
  onAcceptAll,
}) => {
  const t = useTranslations('cookie.preferences');

  // Initialize with current consent or defaults
  const [preferences, setPreferences] = useState({
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    if (isOpen) {
      const consent = getCookieConsent();
      if (consent) {
        setPreferences({
          functional: consent.functional,
          analytics: consent.analytics,
          marketing: consent.marketing,
        });
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    onSave(preferences);
    onClose();
  };

  const handleAcceptAll = () => {
    onAcceptAll();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('title')}
      size="lg"
    >
      <div className="space-y-6">
        {/* Essential Cookies - Always Enabled */}
        <div className="border-b border-neutral-200 pb-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                {t('essential.title')}
              </h3>
              <p className="text-sm text-neutral-600">
                {t('essential.description')}
              </p>
            </div>
            <Toggle
              enabled={true}
              onChange={() => {}}
              disabled={true}
              label=""
            />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            {t('essential.alwaysActive')}
          </p>
        </div>

        {/* Functional Cookies */}
        <div className="border-b border-neutral-200 pb-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 pr-4">
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                {t('functional.title')}
              </h3>
              <p className="text-sm text-neutral-600">
                {t('functional.description')}
              </p>
            </div>
            <Toggle
              enabled={preferences.functional}
              onChange={(enabled) =>
                setPreferences({ ...preferences, functional: enabled })
              }
              label=""
            />
          </div>
        </div>

        {/* Analytics Cookies */}
        <div className="border-b border-neutral-200 pb-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 pr-4">
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                {t('analytics.title')}
              </h3>
              <p className="text-sm text-neutral-600">
                {t('analytics.description')}
              </p>
            </div>
            <Toggle
              enabled={preferences.analytics}
              onChange={(enabled) =>
                setPreferences({ ...preferences, analytics: enabled })
              }
              label=""
            />
          </div>
        </div>

        {/* Marketing Cookies */}
        <div className="pb-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 pr-4">
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                {t('marketing.title')}
              </h3>
              <p className="text-sm text-neutral-600">
                {t('marketing.description')}
              </p>
            </div>
            <Toggle
              enabled={preferences.marketing}
              onChange={(enabled) =>
                setPreferences({ ...preferences, marketing: enabled })
              }
              label=""
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-200">
          <Button
            onClick={handleSave}
            variant="primary"
            fullWidth
            className="sm:flex-1"
          >
            {t('savePreferences')}
          </Button>
          <Button
            onClick={handleAcceptAll}
            variant="outline"
            fullWidth
            className="sm:flex-1"
          >
            {t('acceptAll')}
          </Button>
        </div>

        {/* Link to Cookie Policy */}
        <div className="text-center pt-2">
          <a
            href="/cookie-policy"
            className="text-sm text-primary-600 hover:text-primary-700 underline"
          >
            {t('viewPolicy')}
          </a>
        </div>
      </div>
    </Modal>
  );
};

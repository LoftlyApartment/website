'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CookieCategory,
  CookieConsent,
  getCookieConsent,
  setCookieConsent,
  hasConsent as checkConsent,
  shouldShowBanner as checkShouldShowBanner,
  acceptAllCookies,
  rejectNonEssentialCookies,
  resetConsent as clearConsent,
} from '@/lib/utils/cookies';

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Load consent on mount
  useEffect(() => {
    setIsClient(true);
    const storedConsent = getCookieConsent();
    setConsent(storedConsent);
    setShowBanner(checkShouldShowBanner());
  }, []);

  // Listen for consent changes
  useEffect(() => {
    if (!isClient) return;

    const handleConsentChange = () => {
      const storedConsent = getCookieConsent();
      setConsent(storedConsent);
      setShowBanner(checkShouldShowBanner());
    };

    window.addEventListener('cookieConsentChanged', handleConsentChange);
    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange);
    };
  }, [isClient]);

  const hasConsent = useCallback(
    (category: CookieCategory): boolean => {
      if (!consent) return false;
      return checkConsent(category);
    },
    [consent]
  );

  const acceptAll = useCallback(() => {
    acceptAllCookies();
    setShowBanner(false);
  }, []);

  const rejectNonEssential = useCallback(() => {
    rejectNonEssentialCookies();
    setShowBanner(false);
  }, []);

  const updatePreferences = useCallback((prefs: Partial<Omit<CookieConsent, 'timestamp' | 'version'>>) => {
    const currentConsent = getCookieConsent();
    const newConsent = {
      essential: true,
      functional: prefs.functional ?? currentConsent?.functional ?? false,
      analytics: prefs.analytics ?? currentConsent?.analytics ?? false,
      marketing: prefs.marketing ?? currentConsent?.marketing ?? false,
    };
    setCookieConsent(newConsent);
    setShowBanner(false);
  }, []);

  const resetConsent = useCallback(() => {
    clearConsent();
    setShowBanner(true);
  }, []);

  return {
    consent,
    hasConsent,
    acceptAll,
    rejectNonEssential,
    updatePreferences,
    resetConsent,
    showBanner,
    isClient,
  };
}

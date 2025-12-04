/**
 * Cookie Consent Management Utility
 * Handles GDPR-compliant cookie consent storage and validation
 */

export type CookieCategory = 'essential' | 'functional' | 'analytics' | 'marketing';

export interface CookieConsent {
  essential: boolean; // always true
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
  version: string; // policy version
}

const CONSENT_KEY = 'loftly_cookie_consent';
const CURRENT_VERSION = '1.0';
const CONSENT_VALIDITY_MONTHS = 12;

/**
 * Get the stored cookie consent from localStorage
 */
export function getCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;

    const consent: CookieConsent = JSON.parse(stored);

    // Validate consent structure
    if (!consent.timestamp || !consent.version) return null;

    // Check if consent is expired (12 months)
    const consentDate = new Date(consent.timestamp);
    const expiryDate = new Date(consentDate);
    expiryDate.setMonth(expiryDate.getMonth() + CONSENT_VALIDITY_MONTHS);

    if (new Date() > expiryDate) {
      // Consent expired, remove it
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }

    // Check if policy version changed
    if (consent.version !== CURRENT_VERSION) {
      // Policy updated, need new consent
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }

    return consent;
  } catch (error) {
    console.error('Error reading cookie consent:', error);
    return null;
  }
}

/**
 * Store cookie consent in localStorage
 */
export function setCookieConsent(consent: Omit<CookieConsent, 'timestamp' | 'version'>): void {
  if (typeof window === 'undefined') return;

  try {
    const fullConsent: CookieConsent = {
      ...consent,
      essential: true, // Essential is always true
      timestamp: Date.now(),
      version: CURRENT_VERSION,
    };

    localStorage.setItem(CONSENT_KEY, JSON.stringify(fullConsent));

    // Dispatch custom event for consent change
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: fullConsent }));
  } catch (error) {
    console.error('Error saving cookie consent:', error);
  }
}

/**
 * Check if user has given consent for a specific category
 */
export function hasConsent(category: CookieCategory): boolean {
  const consent = getCookieConsent();

  if (!consent) return false;

  return consent[category] === true;
}

/**
 * Check if cookie banner should be displayed
 */
export function shouldShowBanner(): boolean {
  return getCookieConsent() === null;
}

/**
 * Reset/clear all cookie consent
 */
export function resetConsent(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(CONSENT_KEY);
    window.dispatchEvent(new Event('cookieConsentChanged'));
  } catch (error) {
    console.error('Error resetting cookie consent:', error);
  }
}

/**
 * Accept all cookies
 */
export function acceptAllCookies(): void {
  setCookieConsent({
    essential: true,
    functional: true,
    analytics: true,
    marketing: true,
  });
}

/**
 * Reject all non-essential cookies
 */
export function rejectNonEssentialCookies(): void {
  setCookieConsent({
    essential: true,
    functional: false,
    analytics: false,
    marketing: false,
  });
}

/**
 * Get current policy version
 */
export function getCurrentPolicyVersion(): string {
  return CURRENT_VERSION;
}

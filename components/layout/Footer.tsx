'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

const MailIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const PhoneIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const Footer: React.FC = () => {
  const t = useTranslations();
  const locale = useLocale();

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: '/properties', label: t('nav.properties') },
    { href: '/about', label: t('nav.about') },
    { href: '/faq', label: t('nav.faq') },
    { href: '/blog', label: t('nav.blog') },
    { href: '/contact', label: t('nav.contact') },
  ];

  const legalLinks = [
    { href: '/impressum', label: t('footer.legal.impressum') },
    { href: '/privacy', label: t('footer.legal.privacy') },
    { href: '/terms', label: t('footer.legal.terms') },
    { href: '/cancellation', label: t('footer.legal.cancellation') },
    { href: '/cookies', label: t('footer.legal.cookies') },
  ];

  return (
    <footer className="bg-luxury-charcoal-900 text-luxury-cream-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-display font-bold text-luxury-cream-50">
              {t('common.appName')}
            </h3>
            <p className="text-sm text-luxury-cream-300">
              {t('footer.company.tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-luxury-cream-50">
              {t('footer.sections.quickLinks')}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={`/${locale}${link.href}`}
                    className="text-sm text-luxury-cream-300 hover:text-luxury-cream-50 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-luxury-cream-50">
              {t('footer.sections.legal')}
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={`/${locale}${link.href}`}
                    className="text-sm text-luxury-cream-300 hover:text-luxury-cream-50 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-luxury-cream-50">
              {t('footer.sections.contact')}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:info@loftlyapartment.de"
                  className="flex items-center gap-3 text-sm text-luxury-cream-300 hover:text-luxury-cream-50 transition-colors duration-200"
                >
                  <MailIcon size={18} className="flex-shrink-0" />
                  <span>info@loftlyapartment.de</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+491633595589"
                  className="flex items-center gap-3 text-sm text-luxury-cream-300 hover:text-luxury-cream-50 transition-colors duration-200"
                >
                  <PhoneIcon size={18} className="flex-shrink-0" />
                  <span>+49 163 3595589</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-luxury-beige-900">
          <p className="text-sm text-luxury-cream-400 text-center">
            © {currentYear} {t('common.appName')}. {t('footer.copyright.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

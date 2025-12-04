'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { XIcon } from '@/components/ui/Icons';
import clsx from 'clsx';

// Menu Icon Component
const MenuIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 24 }) => (
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
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// Globe Icon Component
const GlobeIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 24 }) => (
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
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const Header: React.FC = () => {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if on homepage
  const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navigationItems = [
    { href: '/', label: t('nav.home') },
    { href: '/properties', label: t('nav.properties') },
    { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') },
    { href: '/faq', label: t('nav.faq') },
  ];

  const toggleLanguage = () => {
    const newLocale = locale === 'de' ? 'en' : 'de';
    const currentPath = pathname.replace(`/${locale}`, '');
    window.location.href = `/${newLocale}${currentPath}`;
  };

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 left-0 right-0 z-[60] transition-all duration-300 pointer-events-auto',
          isScrolled
            ? 'bg-luxury-cream-50/95 backdrop-blur-md shadow-md'
            : isHomePage
              ? 'bg-transparent'
              : 'bg-luxury-cream-50'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              href={`/${locale}`}
              className={clsx(
                'text-2xl font-display font-bold transition-colors duration-200',
                isScrolled
                  ? 'text-luxury-beige-600'
                  : isHomePage
                    ? 'text-white'
                    : 'text-luxury-charcoal-900'
              )}
              aria-label={t('common.appName')}
            >
              Loftly Apartment
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
              {navigationItems.map((item) => {
                const isActive = pathname === `/${locale}${item.href}` ||
                               (item.href === '/' && pathname === `/${locale}`);

                return (
                  <Link
                    key={item.href}
                    href={`/${locale}${item.href}`}
                    className={clsx(
                      'text-sm font-medium transition-colors duration-200',
                      isActive
                        ? isScrolled || !isHomePage
                          ? 'text-luxury-beige-600'
                          : 'text-white font-semibold'
                        : isScrolled
                          ? 'text-luxury-charcoal-800 hover:text-luxury-beige-600'
                          : isHomePage
                            ? 'text-white/90 hover:text-white'
                            : 'text-luxury-charcoal-800 hover:text-luxury-beige-600'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                  isScrolled
                    ? 'text-luxury-charcoal-800 hover:bg-luxury-cream-100'
                    : isHomePage
                      ? 'text-white hover:bg-white/10'
                      : 'text-luxury-charcoal-800 hover:bg-white/50'
                )}
                aria-label={`Switch to ${locale === 'de' ? 'English' : 'German'}`}
              >
                <GlobeIcon size={18} />
                <span className="uppercase">{locale === 'de' ? 'EN' : 'DE'}</span>
              </button>

              {/* Book Now CTA */}
              <Link href={`/${locale}/booking`}>
                <Button variant={isScrolled || !isHomePage ? 'primary' : 'secondary'} size="md">
                  {t('hero.cta')}
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={clsx(
                'md:hidden p-2 rounded-lg transition-colors duration-200',
                isScrolled
                  ? 'text-luxury-charcoal-800 hover:bg-luxury-cream-100'
                  : isHomePage
                    ? 'text-white hover:bg-white/10'
                    : 'text-luxury-charcoal-800 hover:bg-white/50'
              )}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <MenuIcon size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={clsx(
          'fixed inset-0 bg-black/50 z-[55] transition-opacity duration-300 md:hidden',
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={clsx(
          'fixed top-0 right-0 bottom-0 w-80 max-w-full bg-white z-[60] shadow-2xl transition-transform duration-300 ease-in-out md:hidden',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-label="Mobile navigation"
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-luxury-beige-300">
            <span className="text-xl font-display font-bold text-luxury-beige-600">
              Loftly Apartment
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg text-luxury-charcoal-800 hover:bg-luxury-cream-100 transition-colors duration-200"
              aria-label="Close menu"
            >
              <XIcon size={24} />
            </button>
          </div>

          {/* Mobile Menu Navigation */}
          <nav className="flex-1 overflow-y-auto p-6" aria-label="Mobile navigation">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname === `/${locale}${item.href}` ||
                               (item.href === '/' && pathname === `/${locale}`);

                return (
                  <li key={item.href}>
                    <Link
                      href={`/${locale}${item.href}`}
                      className={clsx(
                        'block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200',
                        isActive
                          ? 'bg-luxury-beige-50 text-luxury-beige-600'
                          : 'text-luxury-charcoal-800 hover:bg-luxury-cream-50'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile Menu Footer */}
          <div className="p-6 border-t border-luxury-beige-300 space-y-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-luxury-charcoal-800 hover:bg-luxury-cream-100 transition-colors duration-200"
              aria-label={`Switch to ${locale === 'de' ? 'English' : 'German'}`}
            >
              <GlobeIcon size={18} />
              <span>
                {locale === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln'}
              </span>
            </button>

            {/* Book Now CTA */}
            <Link href={`/${locale}/booking`}>
              <Button variant="primary" size="md" fullWidth>
                {t('hero.cta')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

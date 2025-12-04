import React from 'react';
import clsx from 'clsx';
import { LoaderIcon } from './Icons';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'fullPage';
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'inline',
  className = '',
  label = 'Loading...',
}) => {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  const iconSize = sizeMap[size];

  if (variant === 'fullPage') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
        role="status"
        aria-live="polite"
        aria-label={label}
      >
        <div className="flex flex-col items-center gap-3">
          <LoaderIcon size={48} className="text-primary-600" />
          <p className="text-neutral-600 font-medium">{label}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx('inline-flex items-center gap-2', className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <LoaderIcon size={iconSize} className="text-primary-600" />
      <span className="sr-only">{label}</span>
    </div>
  );
};

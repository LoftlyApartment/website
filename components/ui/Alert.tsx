'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { CheckIcon, AlertCircleIcon, InfoIcon, XIcon } from './Icons';

export interface AlertProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  title?: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  dismissible = false,
  onDismiss,
  icon: customIcon,
  title,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const baseStyles = 'rounded-lg p-4 flex gap-3 transition-all duration-200';

  const variantStyles = {
    success: 'bg-green-50 border border-green-200 text-green-800',
    error: 'bg-red-50 border border-red-200 text-red-800',
    warning: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border border-blue-200 text-blue-800',
  };

  const iconColorStyles = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  };

  const defaultIcons = {
    success: <CheckIcon className={iconColorStyles.success} size={20} />,
    error: <AlertCircleIcon className={iconColorStyles.error} size={20} />,
    warning: <AlertCircleIcon className={iconColorStyles.warning} size={20} />,
    info: <InfoIcon className={iconColorStyles.info} size={20} />,
  };

  const icon = customIcon || defaultIcons[variant];

  return (
    <div
      className={clsx(baseStyles, variantStyles[variant], className)}
      role="alert"
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
          aria-label="Dismiss alert"
        >
          <XIcon size={16} />
        </button>
      )}
    </div>
  );
};

export interface ToastProps extends Omit<AlertProps, 'dismissible'> {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export const Toast: React.FC<ToastProps> = ({
  children,
  variant = 'info',
  duration = 5000,
  position = 'top-right',
  onDismiss,
  icon,
  title,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const positionStyles = {
    'top-left': 'fixed top-4 left-4',
    'top-center': 'fixed top-4 left-1/2 -translate-x-1/2',
    'top-right': 'fixed top-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'bottom-center': 'fixed bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'fixed bottom-4 right-4',
  };

  return (
    <div className={clsx('z-50 min-w-[300px] max-w-md shadow-large', positionStyles[position])}>
      <Alert
        variant={variant}
        dismissible={true}
        onDismiss={handleDismiss}
        icon={icon}
        title={title}
        className={className}
      >
        {children}
      </Alert>
    </div>
  );
};

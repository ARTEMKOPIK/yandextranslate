import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', className, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
      elevated:
        'bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg shadow-gray-200 dark:shadow-gray-900/50',
      outlined: 'bg-transparent rounded-lg border-2 border-gray-300 dark:border-gray-600',
    };

    return (
      <div
        ref={ref}
        className={clsx('transition-colors duration-200', variantStyles[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

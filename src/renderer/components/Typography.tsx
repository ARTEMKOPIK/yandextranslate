import React from 'react';
import clsx from 'clsx';

export interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export const H1 = ({ children, className }: TypographyProps) => (
  <h1 className={clsx('text-4xl font-bold text-gray-900 dark:text-white', className)}>
    {children}
  </h1>
);

export const H2 = ({ children, className }: TypographyProps) => (
  <h2 className={clsx('text-3xl font-bold text-gray-900 dark:text-white', className)}>
    {children}
  </h2>
);

export const H3 = ({ children, className }: TypographyProps) => (
  <h3 className={clsx('text-2xl font-bold text-gray-900 dark:text-white', className)}>
    {children}
  </h3>
);

export const H4 = ({ children, className }: TypographyProps) => (
  <h4 className={clsx('text-xl font-bold text-gray-900 dark:text-white', className)}>{children}</h4>
);

export const P = ({ children, className }: TypographyProps) => (
  <p className={clsx('text-base text-gray-700 dark:text-gray-300', className)}>{children}</p>
);

export const Small = ({ children, className }: TypographyProps) => (
  <small className={clsx('text-sm text-gray-600 dark:text-gray-400', className)}>{children}</small>
);

export const Label = ({ children, className }: TypographyProps) => (
  <label className={clsx('text-sm font-medium text-gray-700 dark:text-gray-300', className)}>
    {children}
  </label>
);

import React from 'react';
import { H3, P } from '../Typography';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="mb-8">
      <H3 className="mb-2">{title}</H3>
      {description && (
        <P className="text-sm text-gray-600 dark:text-gray-400 mb-4">{description}</P>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

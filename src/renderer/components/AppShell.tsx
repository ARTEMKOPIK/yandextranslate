import React from 'react';

export interface AppShellProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  main?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export const AppShell = ({ header, sidebar, main, footer, children }: AppShellProps) => {
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      {header && (
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
          {header}
        </header>
      )}
      <div className="flex flex-1 overflow-hidden">
        {sidebar && (
          <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
            {sidebar}
          </aside>
        )}
        <main className="flex-1 overflow-y-auto">{main || children}</main>
      </div>
      {footer && (
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
          {footer}
        </footer>
      )}
    </div>
  );
};

'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';

interface ThemeWrapperProps {
  children: React.ReactNode;
  defaultTheme?: string;
  dir?: 'ltr' | 'rtl';
}

export function ThemeWrapper({ children, defaultTheme = 'system', dir = 'ltr' }: ThemeWrapperProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
    >
      {children}
      <Toaster
        position={dir === 'rtl' ? 'top-left' : 'top-right'}
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
        }}
      />
    </ThemeProvider>
  );
}

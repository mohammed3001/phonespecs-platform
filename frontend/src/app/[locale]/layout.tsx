// src/app/[locale]/layout.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import '../globals.css';
import { getSiteSettings } from '@/lib/settings';

interface Props {
  children: React.ReactNode;
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const settings = await getSiteSettings();
  const t = await getTranslations({ locale: params.locale, namespace: 'seo' });

  return {
    metadataBase: new URL(settings.siteUrl || 'https://localhost:3000'),
    title: {
      template: `%s | ${settings.siteName}`,
      default: settings.siteName || 'PhoneSpec',
    },
    description: settings.siteDescription,
    icons: {
      icon: settings.faviconUrl || '/favicon.ico',
    },
    openGraph: {
      siteName: settings.siteName,
      locale: params.locale,
      type: 'website',
    },
  };
}

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  let messages;
  try {
    messages = await getMessages();
  } catch {
    notFound();
  }

  // Determine text direction
  const rtlLocales = ['ar', 'fa', 'ur', 'ku', 'he'];
  const dir = rtlLocales.includes(locale) ? 'rtl' : 'ltr';

  const settings = await getSiteSettings();
  const fontClass = dir === 'rtl' ? 'font-arabic' : 'font-sans';

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={settings.darkMode === 'dark' ? 'dark' : ''}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cairo:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${fontClass} antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme={settings.defaultTheme || 'system'}
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

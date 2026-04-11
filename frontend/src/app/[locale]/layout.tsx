// src/app/[locale]/layout.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '../globals.css';
import { getSiteSettings } from '@/lib/settings';
import { ThemeWrapper } from '@/components/providers/ThemeWrapper';

interface Props {
  children: React.ReactNode;
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    metadataBase: new URL(settings.siteUrl || settings.site_url || 'https://localhost:3000'),
    title: {
      template: `%s | ${settings.siteName || settings.site_name || 'PhoneSpec'}`,
      default: settings.siteName || settings.site_name || 'PhoneSpec',
    },
    description: settings.siteDescription || settings.site_description || 'Mobile phone specs & reviews',
    icons: {
      icon: settings.faviconUrl || settings.favicon_url || '/favicon.ico',
    },
    openGraph: {
      siteName: settings.siteName || settings.site_name || 'PhoneSpec',
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
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cairo:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${fontClass} antialiased bg-white text-gray-900 transition-colors`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeWrapper defaultTheme={settings.defaultTheme || settings.default_theme || 'light'} dir={dir as 'ltr' | 'rtl'}>
            {children}
          </ThemeWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

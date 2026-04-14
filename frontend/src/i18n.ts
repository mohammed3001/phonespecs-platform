// src/i18n.ts
import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'ar'];

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) || 'en';

  if (!locales.includes(locale)) {
    return {
      locale: 'en',
      messages: (await import('./messages/en.json')).default,
    };
  }

  // Load translations
  let messages = {};
  try {
    messages = (await import(`./messages/${locale}.json`)).default;
  } catch {
    // Fallback to English
    try {
      messages = (await import('./messages/en.json')).default;
    } catch {
      messages = {};
    }
  }

  return {
    locale,
    messages,
  };
});

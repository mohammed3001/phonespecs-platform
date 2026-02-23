// src/i18n.ts
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export default getRequestConfig(async ({ locale }) => {
  // Fetch active languages from API
  let locales = ['en', 'ar']; // fallback defaults
  
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/languages/active`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      locales = data.map((l: any) => l.code);
    }
  } catch {
    // use defaults
  }

  if (!locales.includes(locale)) {
    notFound();
  }

  // Load translations
  let messages = {};
  try {
    messages = (await import(`./messages/${locale}.json`)).default;
  } catch {
    // Try to load from API
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/translations/${locale}`,
        { next: { revalidate: 3600 } }
      );
      if (res.ok) {
        messages = await res.json();
      }
    } catch {
      messages = {};
    }
  }

  return {
    locale,
    messages,
  };
});

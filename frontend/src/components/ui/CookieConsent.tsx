'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

export function CookieConsentWrapper() {
  return <CookieConsent />;
}

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookie_consent');
    if (!accepted) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Icon icon="mdi:cookie-outline" width={24} className="text-brand-500 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              We use cookies to enhance your browsing experience and analyze site traffic. By clicking &ldquo;Accept&rdquo;, you consent to our use of cookies.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShow(false)}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={accept}
              className="btn-primary text-sm"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

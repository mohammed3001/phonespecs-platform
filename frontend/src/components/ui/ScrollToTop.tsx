'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

export function ScrollToTopWrapper() {
  return <ScrollToTop />;
}

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center animate-bounce-in"
      aria-label="Scroll to top"
    >
      <Icon icon="mdi:chevron-up" width={24} />
    </button>
  );
}

'use client';

import { Icon } from '@iconify/react';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    { icon: 'mdi:facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, label: 'Facebook', color: 'hover:text-blue-600' },
    { icon: 'mdi:twitter', href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, label: 'Twitter', color: 'hover:text-sky-500' },
    { icon: 'mdi:whatsapp', href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, label: 'WhatsApp', color: 'hover:text-green-500' },
    { icon: 'mdi:telegram', href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, label: 'Telegram', color: 'hover:text-blue-400' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Share:</span>
      {shareLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 ${link.color} transition-colors`}
          title={link.label}
        >
          <Icon icon={link.icon} width={18} />
        </a>
      ))}
      <button
        onClick={handleCopy}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-brand-600 transition-colors"
        title="Copy link"
      >
        <Icon icon="mdi:link-variant" width={18} />
      </button>
    </div>
  );
}

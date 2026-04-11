'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';

interface AddToCompareProps {
  phoneId: string;
  phoneName: string;
}

export function AddToCompare({ phoneId, phoneName }: AddToCompareProps) {
  const [added, setAdded] = useState(false);

  const handleToggle = () => {
    setAdded(!added);
    // In production, this would update a global compare store
    if (!added) {
      const existing = JSON.parse(localStorage.getItem('comparePhones') || '[]');
      if (existing.length < 4 && !existing.includes(phoneId)) {
        existing.push(phoneId);
        localStorage.setItem('comparePhones', JSON.stringify(existing));
      }
    } else {
      const existing = JSON.parse(localStorage.getItem('comparePhones') || '[]');
      localStorage.setItem('comparePhones', JSON.stringify(existing.filter((id: string) => id !== phoneId)));
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
        added
          ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
      title={added ? `Remove ${phoneName} from compare` : `Add ${phoneName} to compare`}
    >
      <Icon icon={added ? 'mdi:check-circle' : 'mdi:compare'} width={18} />
      {added ? 'Added' : 'Compare'}
    </button>
  );
}

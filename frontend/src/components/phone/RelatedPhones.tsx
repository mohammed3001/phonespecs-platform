'use client';

import { PhoneCard } from './PhoneCard';
import { phones } from '@/data/mock-phones';

interface RelatedPhonesProps {
  brandId: string;
  currentPhoneId: string;
  locale?: string;
}

export function RelatedPhones({ brandId, currentPhoneId }: RelatedPhonesProps) {
  const related = phones
    .filter((p) => p.brandId === brandId && p.id !== currentPhoneId)
    .slice(0, 3);

  if (!related.length) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Related Phones
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {related.map((phone) => (
          <PhoneCard key={phone.id} phone={phone} showSponsored={false} />
        ))}
      </div>
    </div>
  );
}

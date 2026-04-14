'use client';

import { Icon } from '@iconify/react';
import type { PhoneSpecGroup } from '@/types/phone';

interface PhoneSpecTableProps {
  specGroups: PhoneSpecGroup[];
  locale?: string;
}

export function PhoneSpecTable({ specGroups }: PhoneSpecTableProps) {
  return (
    <div className="space-y-6">
      {specGroups.map((group) => (
        <div key={group.categorySlug} className="card overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-3 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800">
            {group.icon && <Icon icon={group.icon} width={20} className="text-brand-500" />}
            <h3 className="font-semibold text-gray-900 dark:text-white">{group.category}</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {group.specs.map((spec) => (
              <div key={spec.id} className="flex items-start justify-between px-5 py-3">
                <span className="text-sm text-gray-500 dark:text-gray-400 min-w-[140px] shrink-0">
                  {spec.name}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-end">
                  {spec.displayValue || spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

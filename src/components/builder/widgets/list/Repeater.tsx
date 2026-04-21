'use client';

// =============================================================================
// Repeater Widget — Renders a template for each item in a static array
// Category: List
// =============================================================================

import { type ReactNode } from 'react';
import { WidgetWrapper } from '@/components/builder/core/WidgetWrapper';
import type { WidgetDefinition, WidgetBaseProps } from '@/lib/builder/types';

interface RepeaterItem {
  title?: string;
  description?: string;
  image?: string;
  href?: string;
  [key: string]: unknown;
}

interface RepeaterProps extends WidgetBaseProps {
  items?: RepeaterItem[];
  layout?: 'list' | 'grid' | 'carousel';
  columns?: 1 | 2 | 3 | 4;
  gap?: 'none' | 'sm' | 'md' | 'lg';
  emptyMessage?: string;
  children?: ReactNode;
}

const layoutMap: Record<string, string> = {
  list: 'flex flex-col',
  grid: 'grid',
  carousel: 'flex overflow-x-auto snap-x snap-mandatory',
};

const columnsMap: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

const gapMap: Record<string, string> = {
  none: 'gap-0', sm: 'gap-2', md: 'gap-4', lg: 'gap-6',
};

function RepeaterWidget({
  items = [],
  layout = 'grid',
  columns = 3,
  gap = 'md',
  emptyMessage = 'No items to display',
  children,
  attributes,
}: RepeaterProps) {
  if (!items || items.length === 0) {
    return (
      <WidgetWrapper attributes={attributes} testId="widget-repeater">
        <div className="p-6 text-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg">
          {emptyMessage}
        </div>
      </WidgetWrapper>
    );
  }

  const containerClass = layout === 'grid'
    ? `${layoutMap.grid} ${columnsMap[columns] ?? columnsMap[3]} ${gapMap[gap] ?? 'gap-4'}`
    : `${layoutMap[layout] ?? layoutMap.grid} ${gapMap[gap] ?? 'gap-4'}`;

  return (
    <WidgetWrapper attributes={attributes} testId="widget-repeater">
      <div className={containerClass}>
        {items.map((item, index) => (
          <div
            key={item.title ?? index}
            className={`
              bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700
              overflow-hidden transition-all duration-200 hover:shadow-md
              ${layout === 'carousel' ? 'snap-center flex-shrink-0 w-72' : ''}
            `.trim().replace(/\s+/g, ' ')}
          >
            {item.image && (
              <div className="aspect-video bg-gray-100 dark:bg-slate-700 overflow-hidden">
                <img src={item.image} alt={item.title ?? ''} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              {item.title && (
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{item.title}</h3>
              )}
              {item.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
              )}
              {item.href && (
                <a
                  href={item.href}
                  className="inline-block mt-2 text-sm text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Learn more →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      {children}
    </WidgetWrapper>
  );
}

export const repeaterDefinition: WidgetDefinition<RepeaterProps> = {
  id: 'repeater',
  type: 'repeater',
  name: 'Repeater',
  category: 'list',
  description: 'Renders cards for each item in a static array',
  icon: '📋',
  component: RepeaterWidget,
  canHaveChildren: true,
  defaults: { layout: 'grid', columns: 3, gap: 'md' },
  inputs: [
    {
      name: 'items',
      friendlyName: 'Items',
      type: 'list',
      defaultValue: [
        { title: 'Item 1', description: 'Description for item 1' },
        { title: 'Item 2', description: 'Description for item 2' },
        { title: 'Item 3', description: 'Description for item 3' },
      ],
      subFields: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'image', type: 'file' },
        { name: 'href', friendlyName: 'Link URL', type: 'url' },
      ],
    },
    { name: 'layout', type: 'string', defaultValue: 'grid', enum: ['list', 'grid', 'carousel'] },
    { name: 'columns', type: 'number', defaultValue: 3, enum: [{ label: '1', value: 1 }, { label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }], showIf: 'options.get("layout") === "grid"' },
    { name: 'gap', type: 'string', defaultValue: 'md', enum: ['none', 'sm', 'md', 'lg'] },
    { name: 'emptyMessage', friendlyName: 'Empty Message', type: 'string', defaultValue: 'No items to display' },
  ],
  tags: ['list', 'repeater', 'cards', 'collection'],
};

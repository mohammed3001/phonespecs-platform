'use client';

// =============================================================================
// Columns Widget — Two or more columns with defined distribution
// Category: Layouts
// =============================================================================

import { type ReactNode } from 'react';
import { WidgetWrapper } from '@/components/builder/core/WidgetWrapper';
import type { WidgetDefinition, WidgetBaseProps } from '@/lib/builder/types';

interface ColumnsProps extends WidgetBaseProps {
  distribution?: '50/50' | '33/67' | '67/33' | '25/75' | '75/25' | '33/33/33' | '25/50/25';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  stackOnMobile?: boolean;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  children?: ReactNode;
}

const distributionMap: Record<string, string> = {
  '50/50': 'grid-cols-1 md:grid-cols-2',
  '33/67': 'grid-cols-1 md:grid-cols-[1fr_2fr]',
  '67/33': 'grid-cols-1 md:grid-cols-[2fr_1fr]',
  '25/75': 'grid-cols-1 md:grid-cols-[1fr_3fr]',
  '75/25': 'grid-cols-1 md:grid-cols-[3fr_1fr]',
  '33/33/33': 'grid-cols-1 md:grid-cols-3',
  '25/50/25': 'grid-cols-1 md:grid-cols-[1fr_2fr_1fr]',
};

const gapMap: Record<string, string> = {
  none: 'gap-0', sm: 'gap-2', md: 'gap-4', lg: 'gap-6', xl: 'gap-8',
};

const alignMap: Record<string, string> = {
  start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch',
};

function ColumnsWidget({
  distribution = '50/50',
  gap = 'md',
  stackOnMobile = true,
  alignItems = 'stretch',
  children,
  attributes,
}: ColumnsProps) {
  const gridClass = stackOnMobile
    ? (distributionMap[distribution] ?? distributionMap['50/50'])
    : (distributionMap[distribution] ?? distributionMap['50/50']).replace('grid-cols-1 ', '');

  return (
    <WidgetWrapper attributes={attributes} testId="widget-columns">
      <div className={`grid ${gridClass} ${gapMap[gap] ?? 'gap-4'} ${alignMap[alignItems] ?? 'items-stretch'}`}>
        {children}
      </div>
    </WidgetWrapper>
  );
}

export const columnsDefinition: WidgetDefinition<ColumnsProps> = {
  id: 'columns',
  type: 'columns',
  name: 'Columns',
  category: 'layouts',
  description: 'Two or more columns with defined distribution',
  icon: '▥',
  component: ColumnsWidget,
  canHaveChildren: true,
  defaults: { distribution: '50/50', gap: 'md', stackOnMobile: true },
  inputs: [
    {
      name: 'distribution',
      friendlyName: 'Column Distribution',
      type: 'string',
      defaultValue: '50/50',
      enum: ['50/50', '33/67', '67/33', '25/75', '75/25', '33/33/33', '25/50/25'],
    },
    { name: 'gap', type: 'string', defaultValue: 'md', enum: ['none', 'sm', 'md', 'lg', 'xl'] },
    { name: 'stackOnMobile', friendlyName: 'Stack on Mobile', type: 'boolean', defaultValue: true },
    { name: 'alignItems', friendlyName: 'Align Items', type: 'string', defaultValue: 'stretch', enum: ['start', 'center', 'end', 'stretch'] },
  ],
  tags: ['layout', 'columns', 'split'],
};

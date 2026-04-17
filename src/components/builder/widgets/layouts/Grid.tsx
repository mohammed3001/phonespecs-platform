'use client';

// =============================================================================
// Grid Widget — CSS Grid layout with responsive columns
// Category: Layouts
// =============================================================================

import { type ReactNode } from 'react';
import { WidgetWrapper } from '@/components/builder/core/WidgetWrapper';
import type { WidgetDefinition, WidgetBaseProps } from '@/lib/builder/types';

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface GridProps extends WidgetBaseProps {
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  minChildWidth?: string;
  children?: ReactNode;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const columnsMap: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
};

const gapMap: Record<string, string> = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const alignMap: Record<string, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

function GridWidget({
  columns = 3,
  gap = 'md',
  alignItems = 'stretch',
  children,
  attributes,
}: GridProps) {
  return (
    <WidgetWrapper attributes={attributes} testId="widget-grid">
      <div
        className={`grid ${columnsMap[columns] ?? columnsMap[3]} ${gapMap[gap] ?? 'gap-4'} ${alignMap[alignItems] ?? 'items-stretch'}`}
      >
        {children}
      </div>
    </WidgetWrapper>
  );
}

// -----------------------------------------------------------------------------
// Widget Definition
// -----------------------------------------------------------------------------

export const gridDefinition: WidgetDefinition<GridProps> = {
  id: 'grid',
  type: 'grid',
  name: 'Grid',
  category: 'layouts',
  description: 'CSS Grid layout with responsive columns',
  icon: '⊞',
  component: GridWidget,
  canHaveChildren: true,
  defaults: { columns: 3, gap: 'md', alignItems: 'stretch' },
  inputs: [
    {
      name: 'columns',
      friendlyName: 'Columns',
      type: 'number',
      defaultValue: 3,
      enum: [
        { label: '1 Column', value: 1 },
        { label: '2 Columns', value: 2 },
        { label: '3 Columns', value: 3 },
        { label: '4 Columns', value: 4 },
        { label: '5 Columns', value: 5 },
        { label: '6 Columns', value: 6 },
      ],
    },
    {
      name: 'gap',
      friendlyName: 'Gap',
      type: 'string',
      defaultValue: 'md',
      enum: ['none', 'sm', 'md', 'lg', 'xl'],
    },
    {
      name: 'alignItems',
      friendlyName: 'Align Items',
      type: 'string',
      defaultValue: 'stretch',
      enum: ['start', 'center', 'end', 'stretch'],
    },
  ],
  tags: ['layout', 'grid', 'columns'],
};

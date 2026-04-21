'use client';

// =============================================================================
// Section Widget — Primary page section container with max-width and padding
// Category: Layouts
// =============================================================================

import { type ReactNode } from 'react';
import { WidgetWrapper } from '@/components/builder/core/WidgetWrapper';
import type { WidgetDefinition, WidgetBaseProps } from '@/lib/builder/types';

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface SectionProps extends WidgetBaseProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  paddingX?: 'none' | 'sm' | 'md' | 'lg';
  background?: 'transparent' | 'default' | 'alt' | 'primary' | 'surface';
  fullBleed?: boolean;
  children?: ReactNode;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const maxWidthMap: Record<string, string> = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

const pyMap: Record<string, string> = {
  none: 'py-0',
  sm: 'py-4',
  md: 'py-8',
  lg: 'py-12',
  xl: 'py-16',
};

const pxMap: Record<string, string> = {
  none: 'px-0',
  sm: 'px-4',
  md: 'px-6 sm:px-8',
  lg: 'px-8 sm:px-12',
};

const bgMap: Record<string, string> = {
  transparent: '',
  default: 'bg-white dark:bg-slate-900',
  alt: 'bg-gray-50 dark:bg-slate-800',
  primary: 'bg-teal-50 dark:bg-teal-950',
  surface: 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700',
};

function SectionWidget({
  maxWidth = 'xl',
  paddingY = 'md',
  paddingX = 'md',
  background = 'transparent',
  fullBleed = false,
  children,
  attributes,
}: SectionProps) {
  const outerBg = bgMap[background] ?? '';
  const inner = `${maxWidthMap[maxWidth] ?? 'max-w-screen-xl'} mx-auto ${pxMap[paddingX] ?? ''}`;

  return (
    <WidgetWrapper attributes={attributes} testId="widget-section">
      <section className={`${pyMap[paddingY] ?? ''} ${fullBleed ? '' : outerBg}`.trim()}>
        <div className={`${inner} ${fullBleed ? outerBg : ''}`.trim()}>
          {children}
        </div>
      </section>
    </WidgetWrapper>
  );
}

// -----------------------------------------------------------------------------
// Widget Definition
// -----------------------------------------------------------------------------

export const sectionDefinition: WidgetDefinition<SectionProps> = {
  id: 'section',
  type: 'section',
  name: 'Section',
  category: 'layouts',
  description: 'Primary page section with max-width, padding, and background',
  icon: '📐',
  component: SectionWidget,
  canHaveChildren: true,
  defaultStyles: { marginTop: '0px' },
  defaults: { maxWidth: 'xl', paddingY: 'md', paddingX: 'md', background: 'transparent' },
  inputs: [
    {
      name: 'maxWidth',
      friendlyName: 'Max Width',
      type: 'string',
      defaultValue: 'xl',
      enum: ['sm', 'md', 'lg', 'xl', '2xl', 'full'],
      helperText: 'Maximum width of the section content',
    },
    {
      name: 'paddingY',
      friendlyName: 'Vertical Padding',
      type: 'string',
      defaultValue: 'md',
      enum: ['none', 'sm', 'md', 'lg', 'xl'],
    },
    {
      name: 'paddingX',
      friendlyName: 'Horizontal Padding',
      type: 'string',
      defaultValue: 'md',
      enum: ['none', 'sm', 'md', 'lg'],
    },
    {
      name: 'background',
      friendlyName: 'Background',
      type: 'string',
      defaultValue: 'transparent',
      enum: ['transparent', 'default', 'alt', 'primary', 'surface'],
    },
    {
      name: 'fullBleed',
      friendlyName: 'Full Bleed Background',
      type: 'boolean',
      defaultValue: false,
      helperText: 'Extend background color to full viewport width',
    },
  ],
  tags: ['layout', 'container', 'section'],
};

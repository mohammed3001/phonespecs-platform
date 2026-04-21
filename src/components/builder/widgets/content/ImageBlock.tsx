'use client';

// =============================================================================
// ImageBlock Widget — Optimized image with Next.js Image component
// Category: Content
// =============================================================================

import Image from 'next/image';
import { WidgetWrapper } from '@/components/builder/core/WidgetWrapper';
import type { WidgetDefinition, WidgetBaseProps } from '@/lib/builder/types';

interface ImageBlockProps extends WidgetBaseProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  priority?: boolean;
}

const radiusMap: Record<string, string> = {
  none: 'rounded-none', sm: 'rounded-sm', md: 'rounded-md',
  lg: 'rounded-lg', xl: 'rounded-xl', full: 'rounded-full',
};

const shadowMap: Record<string, string> = {
  none: '', sm: 'shadow-sm', md: 'shadow-md', lg: 'shadow-lg',
};

function ImageBlockWidget({
  src = '',
  alt = '',
  width = 800,
  height = 400,
  objectFit = 'cover',
  borderRadius = 'md',
  shadow = 'none',
  priority = false,
  attributes,
}: ImageBlockProps) {
  if (!src) {
    return (
      <WidgetWrapper attributes={attributes} testId="widget-image-block">
        <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-slate-800 rounded-md border-2 border-dashed border-gray-300 dark:border-slate-600">
          <span className="text-gray-400 dark:text-gray-500 text-sm">Add an image URL</span>
        </div>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper attributes={attributes} testId="widget-image-block">
      <div className={`overflow-hidden ${radiusMap[borderRadius] ?? ''} ${shadowMap[shadow] ?? ''}`.trim()}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-auto object-${objectFit}`}
          priority={priority}
        />
      </div>
    </WidgetWrapper>
  );
}

export const imageBlockDefinition: WidgetDefinition<ImageBlockProps> = {
  id: 'image-block',
  type: 'image-block',
  name: 'Image Block',
  category: 'content',
  description: 'Optimized image with Next.js Image component',
  icon: '🖼️',
  component: ImageBlockWidget,
  canHaveChildren: false,
  defaults: { objectFit: 'cover', borderRadius: 'md', shadow: 'none' },
  inputs: [
    { name: 'src', friendlyName: 'Image URL', type: 'file', required: true, helperText: 'Upload or paste image URL' },
    { name: 'alt', friendlyName: 'Alt Text', type: 'string', defaultValue: '', helperText: 'Accessibility description' },
    { name: 'width', type: 'number', defaultValue: 800 },
    { name: 'height', type: 'number', defaultValue: 400 },
    { name: 'objectFit', friendlyName: 'Object Fit', type: 'string', defaultValue: 'cover', enum: ['contain', 'cover', 'fill', 'none'] },
    { name: 'borderRadius', friendlyName: 'Border Radius', type: 'string', defaultValue: 'md', enum: ['none', 'sm', 'md', 'lg', 'xl', 'full'] },
    { name: 'shadow', type: 'string', defaultValue: 'none', enum: ['none', 'sm', 'md', 'lg'] },
    { name: 'priority', friendlyName: 'Priority Load', type: 'boolean', defaultValue: false, helperText: 'Load this image immediately (above-the-fold)' },
  ],
  tags: ['content', 'image', 'media'],
};

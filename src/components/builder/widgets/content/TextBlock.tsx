'use client';

// =============================================================================
// TextBlock Widget — Text content with semantic HTML tags
// Category: Content
// =============================================================================

import { WidgetWrapper } from '@/components/builder/core/WidgetWrapper';
import type { WidgetDefinition, WidgetBaseProps } from '@/lib/builder/types';

interface TextBlockProps extends WidgetBaseProps {
  text?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  align?: 'left' | 'center' | 'right';
  color?: 'default' | 'muted' | 'primary' | 'inverse';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
}

const colorMap: Record<string, string> = {
  default: 'text-gray-900 dark:text-gray-100',
  muted: 'text-gray-500 dark:text-gray-400',
  primary: 'text-teal-600 dark:text-teal-400',
  inverse: 'text-white dark:text-gray-900',
};

const sizeMap: Record<string, string> = {
  sm: 'text-sm', base: 'text-base', lg: 'text-lg', xl: 'text-xl',
  '2xl': 'text-2xl', '3xl': 'text-3xl', '4xl': 'text-4xl',
};

const weightMap: Record<string, string> = {
  normal: 'font-normal', medium: 'font-medium', semibold: 'font-semibold',
  bold: 'font-bold', extrabold: 'font-extrabold',
};

const alignMap: Record<string, string> = {
  left: 'text-left', center: 'text-center', right: 'text-right',
};

function TextBlockWidget({
  text = 'Enter your text here',
  tag = 'p',
  align = 'left',
  color = 'default',
  fontSize = 'base',
  fontWeight = 'normal',
  attributes,
}: TextBlockProps) {
  const Tag = tag;
  const classes = `${colorMap[color] ?? ''} ${sizeMap[fontSize] ?? ''} ${weightMap[fontWeight] ?? ''} ${alignMap[align] ?? ''}`.trim();

  return (
    <WidgetWrapper attributes={attributes} testId="widget-text-block">
      <Tag className={classes}>{text}</Tag>
    </WidgetWrapper>
  );
}

export const textBlockDefinition: WidgetDefinition<TextBlockProps> = {
  id: 'text-block',
  type: 'text-block',
  name: 'Text Block',
  category: 'content',
  description: 'Text content with semantic HTML tags and styling',
  icon: '📝',
  component: TextBlockWidget,
  canHaveChildren: false,
  defaults: { text: 'Enter your text here', tag: 'p', align: 'left', color: 'default', fontSize: 'base' },
  inputs: [
    { name: 'text', friendlyName: 'Text', type: 'longText', defaultValue: 'Enter your text here', required: true },
    { name: 'tag', friendlyName: 'HTML Tag', type: 'string', defaultValue: 'p', enum: ['h1', 'h2', 'h3', 'h4', 'p', 'span'] },
    { name: 'align', friendlyName: 'Alignment', type: 'string', defaultValue: 'left', enum: ['left', 'center', 'right'] },
    { name: 'color', friendlyName: 'Color', type: 'string', defaultValue: 'default', enum: ['default', 'muted', 'primary', 'inverse'] },
    { name: 'fontSize', friendlyName: 'Font Size', type: 'string', defaultValue: 'base', enum: ['sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'] },
    { name: 'fontWeight', friendlyName: 'Font Weight', type: 'string', defaultValue: 'normal', enum: ['normal', 'medium', 'semibold', 'bold', 'extrabold'] },
  ],
  tags: ['content', 'text', 'heading', 'paragraph'],
};

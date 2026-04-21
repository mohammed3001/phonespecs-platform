'use client';

// =============================================================================
// Button Widget — Versatile button with variants, sizes, icons, and actions
// Category: Controls
// =============================================================================

import Link from 'next/link';
import { WidgetWrapper } from '@/components/builder/core/WidgetWrapper';
import type { WidgetDefinition, WidgetBaseProps } from '@/lib/builder/types';

interface ButtonProps extends WidgetBaseProps {
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  fullWidth?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
}

const variantMap: Record<string, string> = {
  primary: 'bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600 shadow-sm',
  secondary: 'bg-slate-600 hover:bg-slate-700 text-white dark:bg-slate-500 dark:hover:bg-slate-600 shadow-sm',
  outline: 'border-2 border-teal-600 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-950',
  ghost: 'text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-950',
  danger: 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 shadow-sm',
};

const sizeMap: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-5 py-2.5 text-base rounded-lg',
  lg: 'px-7 py-3.5 text-lg rounded-xl',
};

function ButtonWidget({
  label = 'Click me',
  variant = 'primary',
  size = 'md',
  href,
  fullWidth = false,
  disabled = false,
  attributes,
}: ButtonProps) {
  const classes = `
    inline-flex items-center justify-center gap-2
    font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
    dark:focus:ring-offset-slate-900
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantMap[variant] ?? variantMap.primary}
    ${sizeMap[size] ?? sizeMap.md}
    ${fullWidth ? 'w-full' : ''}
  `.trim().replace(/\s+/g, ' ');

  const content = <span>{label}</span>;

  if (href && !disabled) {
    return (
      <WidgetWrapper attributes={attributes} testId="widget-button">
        <Link href={href} className={classes}>
          {content}
        </Link>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper attributes={attributes} testId="widget-button">
      <button className={classes} disabled={disabled} type="button">
        {content}
      </button>
    </WidgetWrapper>
  );
}

export const buttonDefinition: WidgetDefinition<ButtonProps> = {
  id: 'button',
  type: 'button',
  name: 'Button',
  category: 'controls',
  description: 'Versatile button with variants, sizes, and optional link',
  icon: '🔘',
  component: ButtonWidget,
  canHaveChildren: false,
  defaults: { label: 'Click me', variant: 'primary', size: 'md' },
  inputs: [
    { name: 'label', friendlyName: 'Label', type: 'string', defaultValue: 'Click me', required: true },
    { name: 'variant', type: 'string', defaultValue: 'primary', enum: ['primary', 'secondary', 'outline', 'ghost', 'danger'] },
    { name: 'size', type: 'string', defaultValue: 'md', enum: ['sm', 'md', 'lg'] },
    { name: 'href', friendlyName: 'Link URL', type: 'url', helperText: 'Makes the button a link' },
    { name: 'fullWidth', friendlyName: 'Full Width', type: 'boolean', defaultValue: false },
    { name: 'disabled', type: 'boolean', defaultValue: false },
  ],
  tags: ['controls', 'button', 'cta', 'action'],
};

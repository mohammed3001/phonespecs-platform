'use client';

// =============================================================================
// NavigationMenu Widget — Dynamic navigation menu with multiple layouts
// Category: Tools
// =============================================================================

import Link from 'next/link';
import { useState } from 'react';
import { WidgetWrapper } from '@/components/builder/core/WidgetWrapper';
import type { WidgetDefinition, WidgetBaseProps } from '@/lib/builder/types';

interface NavItem {
  label: string;
  href: string;
  icon?: string;
  isExternal?: boolean;
  isActive?: boolean;
  children?: NavItem[];
}

interface NavigationMenuProps extends WidgetBaseProps {
  items?: NavItem[];
  layout?: 'horizontal' | 'vertical' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  activeStyle?: 'underline' | 'background' | 'bold';
}

const sizeMap: Record<string, string> = {
  sm: 'text-sm py-1 px-2',
  md: 'text-base py-2 px-3',
  lg: 'text-lg py-3 px-4',
};

const activeStyleMap: Record<string, string> = {
  underline: 'border-b-2 border-teal-500',
  background: 'bg-teal-50 dark:bg-teal-950 rounded-lg',
  bold: 'font-bold',
};

function NavigationMenuWidget({
  items = [],
  layout = 'horizontal',
  size = 'md',
  activeStyle = 'underline',
  attributes,
}: NavigationMenuProps) {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  if (!items || items.length === 0) {
    return (
      <WidgetWrapper attributes={attributes} testId="widget-navigation-menu">
        <div className="p-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg text-center text-gray-400">
          Add navigation items
        </div>
      </WidgetWrapper>
    );
  }

  const containerClass = layout === 'vertical'
    ? 'flex flex-col gap-1'
    : 'flex items-center gap-1 flex-wrap';

  return (
    <WidgetWrapper attributes={attributes} testId="widget-navigation-menu">
      <nav>
        <ul className={containerClass}>
          {items.map((item, index) => (
            <li
              key={item.href ?? index}
              className="relative"
              onMouseEnter={() => item.children?.length && setOpenDropdown(index)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href={item.href}
                target={item.isExternal ? '_blank' : undefined}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
                className={`
                  inline-flex items-center gap-1.5
                  ${sizeMap[size] ?? sizeMap.md}
                  ${item.isActive ? activeStyleMap[activeStyle] ?? '' : ''}
                  text-gray-700 dark:text-gray-300
                  hover:text-teal-600 dark:hover:text-teal-400
                  transition-colors duration-200
                `.trim().replace(/\s+/g, ' ')}
              >
                {item.label}
                {item.children && item.children.length > 0 && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </Link>

              {/* Dropdown children */}
              {item.children && item.children.length > 0 && openDropdown === index && (
                <ul className="
                  absolute z-40 top-full left-0 mt-1
                  bg-white dark:bg-slate-800
                  border border-gray-200 dark:border-slate-700
                  rounded-lg shadow-lg min-w-[200px] py-1
                ">
                  {item.children.map((child, childIndex) => (
                    <li key={child.href ?? childIndex}>
                      <Link
                        href={child.href}
                        className="
                          block px-4 py-2 text-sm
                          text-gray-700 dark:text-gray-300
                          hover:bg-gray-50 dark:hover:bg-slate-700
                          hover:text-teal-600 dark:hover:text-teal-400
                          transition-colors duration-150
                        "
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </WidgetWrapper>
  );
}

export const navigationMenuDefinition: WidgetDefinition<NavigationMenuProps> = {
  id: 'navigation-menu',
  type: 'navigation-menu',
  name: 'Navigation Menu',
  category: 'tools',
  description: 'Dynamic navigation menu with horizontal, vertical, or dropdown layout',
  icon: '🧭',
  component: NavigationMenuWidget,
  canHaveChildren: false,
  defaults: { layout: 'horizontal', size: 'md', activeStyle: 'underline' },
  inputs: [
    {
      name: 'items',
      friendlyName: 'Menu Items',
      type: 'list',
      defaultValue: [
        { label: 'Home', href: '/' },
        { label: 'Phones', href: '/phones' },
        { label: 'Brands', href: '/brands' },
        { label: 'Compare', href: '/compare' },
      ],
      subFields: [
        { name: 'label', type: 'string', required: true },
        { name: 'href', friendlyName: 'URL', type: 'url', required: true },
        { name: 'icon', type: 'string' },
        { name: 'isExternal', friendlyName: 'External Link', type: 'boolean', defaultValue: false },
        {
          name: 'children',
          friendlyName: 'Dropdown Items',
          type: 'list',
          subFields: [
            { name: 'label', type: 'string', required: true },
            { name: 'href', friendlyName: 'URL', type: 'url', required: true },
          ],
        },
      ],
    },
    { name: 'layout', type: 'string', defaultValue: 'horizontal', enum: ['horizontal', 'vertical', 'dropdown'] },
    { name: 'size', type: 'string', defaultValue: 'md', enum: ['sm', 'md', 'lg'] },
    { name: 'activeStyle', friendlyName: 'Active Style', type: 'string', defaultValue: 'underline', enum: ['underline', 'background', 'bold'] },
  ],
  tags: ['tools', 'navigation', 'menu', 'nav'],
};

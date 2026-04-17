'use client';

// =============================================================================
// WidgetWrapper — Base wrapper that ensures design consistency for all widgets
// =============================================================================

import { type ReactNode } from 'react';

interface WidgetWrapperProps {
  /** Builder.io attributes (classes, data-attributes) */
  attributes?: Record<string, unknown>;
  /** Widget children */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Test ID for automated testing */
  testId?: string;
}

/**
 * Wraps every widget with consistent spacing, dark mode support,
 * and Builder.io attribute forwarding.
 */
export function WidgetWrapper({
  attributes,
  children,
  className = '',
  testId,
}: WidgetWrapperProps) {
  return (
    <div
      {...(attributes as React.HTMLAttributes<HTMLDivElement>)}
      className={`w-full ${className} ${
        (attributes as Record<string, string>)?.className ?? ''
      }`.trim()}
      data-testid={testId}
    >
      {children}
    </div>
  );
}

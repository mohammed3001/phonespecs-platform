'use client';

// =============================================================================
// Condition Widget — Conditional rendering based on Builder state
// Category: Logical
// =============================================================================

import { type ReactNode } from 'react';
import { WidgetWrapper } from '@/components/builder/core/WidgetWrapper';
import type { WidgetDefinition, WidgetBaseProps } from '@/lib/builder/types';

interface ConditionProps extends WidgetBaseProps {
  stateKey?: string;
  operator?: 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'exists' | 'empty';
  value?: string;
  children?: ReactNode;
}

function evaluateCondition(
  stateValue: unknown,
  operator: string,
  compareValue: string
): boolean {
  switch (operator) {
    case 'exists':
      return stateValue !== undefined && stateValue !== null;
    case 'empty':
      return !stateValue || (Array.isArray(stateValue) && stateValue.length === 0) || stateValue === '';
    case 'eq':
      return String(stateValue) === compareValue;
    case 'neq':
      return String(stateValue) !== compareValue;
    case 'gt':
      return Number(stateValue) > Number(compareValue);
    case 'lt':
      return Number(stateValue) < Number(compareValue);
    case 'contains':
      return String(stateValue).toLowerCase().includes(compareValue.toLowerCase());
    default:
      return true;
  }
}

function ConditionWidget({
  stateKey = '',
  operator = 'exists',
  value = '',
  children,
  attributes,
  builderState,
}: ConditionProps) {
  // In editor mode, always show children with a visual indicator
  if (!stateKey) {
    return (
      <WidgetWrapper attributes={attributes} testId="widget-condition">
        <div className="border-2 border-dashed border-amber-300 dark:border-amber-600 rounded-lg p-2">
          <div className="text-xs text-amber-600 dark:text-amber-400 mb-1 font-mono">
            ⚡ Condition: Set a state key
          </div>
          {children}
        </div>
      </WidgetWrapper>
    );
  }

  const stateValue = builderState?.state?.[stateKey];
  const shouldShow = evaluateCondition(stateValue, operator, value);

  if (!shouldShow) return null;

  return (
    <WidgetWrapper attributes={attributes} testId="widget-condition">
      {children}
    </WidgetWrapper>
  );
}

export const conditionDefinition: WidgetDefinition<ConditionProps> = {
  id: 'condition',
  type: 'condition',
  name: 'Condition',
  category: 'logical',
  description: 'Show or hide children based on Builder state conditions',
  icon: '🧠',
  component: ConditionWidget,
  canHaveChildren: true,
  defaults: { operator: 'exists' },
  inputs: [
    { name: 'stateKey', friendlyName: 'State Key', type: 'string', required: true, helperText: 'The Builder state key to evaluate' },
    {
      name: 'operator', type: 'string', defaultValue: 'exists',
      enum: [
        { label: 'Exists (not null)', value: 'exists' },
        { label: 'Is Empty', value: 'empty' },
        { label: 'Equals', value: 'eq' },
        { label: 'Not Equals', value: 'neq' },
        { label: 'Greater Than', value: 'gt' },
        { label: 'Less Than', value: 'lt' },
        { label: 'Contains', value: 'contains' },
      ],
    },
    { name: 'value', friendlyName: 'Compare Value', type: 'string', helperText: 'Value to compare against (for eq, neq, gt, lt, contains)', showIf: 'options.get("operator") !== "exists" && options.get("operator") !== "empty"' },
  ],
  tags: ['logical', 'condition', 'if-else', 'visibility'],
};

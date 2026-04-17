'use client';

// =============================================================================
// TextInput Widget — Form input field with label and state binding
// Category: Controls
// =============================================================================

import { useState, useCallback } from 'react';
import { WidgetWrapper } from '@/components/builder/core/WidgetWrapper';
import type { WidgetDefinition, WidgetBaseProps } from '@/lib/builder/types';

interface TextInputProps extends WidgetBaseProps {
  label?: string;
  placeholder?: string;
  name?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  required?: boolean;
  helperText?: string;
  stateKey?: string;
  defaultValue?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-5 py-3.5 text-lg',
};

function TextInputWidget({
  label,
  placeholder = '',
  name = '',
  type = 'text',
  required = false,
  helperText,
  stateKey,
  defaultValue = '',
  size = 'md',
  attributes,
  builderState,
}: TextInputProps) {
  const [value, setValue] = useState(defaultValue);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      if (stateKey && builderState?.setState) {
        builderState.setState({ [stateKey]: newValue });
      }
    },
    [stateKey, builderState]
  );

  return (
    <WidgetWrapper attributes={attributes} testId="widget-text-input">
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={name || stateKey}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          id={name || stateKey}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          className={`
            ${sizeMap[size] ?? sizeMap.md}
            rounded-lg border border-gray-300 dark:border-slate-600
            bg-white dark:bg-slate-800
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
            dark:focus:ring-offset-slate-900
            transition-all duration-200
          `.trim().replace(/\s+/g, ' ')}
        />
        {helperText && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    </WidgetWrapper>
  );
}

export const textInputDefinition: WidgetDefinition<TextInputProps> = {
  id: 'text-input',
  type: 'text-input',
  name: 'Text Input',
  category: 'controls',
  description: 'Form input field with label and Builder state binding',
  icon: '✏️',
  component: TextInputWidget,
  canHaveChildren: false,
  defaults: { type: 'text', size: 'md' },
  inputs: [
    { name: 'label', type: 'string', helperText: 'Label shown above the input' },
    { name: 'placeholder', type: 'string', defaultValue: '' },
    { name: 'name', friendlyName: 'Field Name', type: 'string', helperText: 'HTML name attribute for form submission' },
    { name: 'type', friendlyName: 'Input Type', type: 'string', defaultValue: 'text', enum: ['text', 'email', 'password', 'number', 'tel', 'url'] },
    { name: 'required', type: 'boolean', defaultValue: false },
    { name: 'helperText', friendlyName: 'Helper Text', type: 'string' },
    { name: 'stateKey', friendlyName: 'State Key', type: 'string', helperText: 'Builder state key to bind this input value to' },
    { name: 'defaultValue', friendlyName: 'Default Value', type: 'string', defaultValue: '' },
    { name: 'size', type: 'string', defaultValue: 'md', enum: ['sm', 'md', 'lg'] },
  ],
  tags: ['controls', 'input', 'form', 'field'],
};

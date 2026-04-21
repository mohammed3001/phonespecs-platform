'use client';

// =============================================================================
// ApiFetch Widget — Fetches data from an API and stores in Builder state
// Category: Data
// =============================================================================

import { useState, useEffect, type ReactNode } from 'react';
import { WidgetWrapper } from '@/components/builder/core/WidgetWrapper';
import type { WidgetDefinition, WidgetBaseProps } from '@/lib/builder/types';

interface ApiFetchProps extends WidgetBaseProps {
  url?: string;
  method?: 'GET' | 'POST';
  stateKey?: string;
  autoFetch?: boolean;
  loadingText?: string;
  errorText?: string;
  children?: ReactNode;
}

function ApiFetchWidget({
  url = '',
  method = 'GET',
  stateKey = 'data',
  autoFetch = true,
  loadingText = 'Loading...',
  errorText = 'Failed to load data',
  children,
  attributes,
  builderState,
}: ApiFetchProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url || !autoFetch) return;

    const controller = new AbortController();

    async function fetchData() {
      setStatus('loading');
      setError(null);
      try {
        const res = await fetch(url, {
          method,
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (builderState?.setState) {
          builderState.setState({ [stateKey]: data });
        }
        setStatus('success');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message);
          setStatus('error');
        }
      }
    }

    fetchData();
    return () => controller.abort();
  }, [url, method, stateKey, autoFetch, builderState]);

  if (!url) {
    return (
      <WidgetWrapper attributes={attributes} testId="widget-api-fetch">
        <div className="p-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg text-center text-gray-400">
          Configure an API URL to fetch data
        </div>
      </WidgetWrapper>
    );
  }

  if (status === 'loading') {
    return (
      <WidgetWrapper attributes={attributes} testId="widget-api-fetch">
        <div className="flex items-center justify-center gap-2 p-4 text-gray-500 dark:text-gray-400">
          <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">{loadingText}</span>
        </div>
      </WidgetWrapper>
    );
  }

  if (status === 'error') {
    return (
      <WidgetWrapper attributes={attributes} testId="widget-api-fetch">
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {errorText}: {error}
        </div>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper attributes={attributes} testId="widget-api-fetch">
      {children}
    </WidgetWrapper>
  );
}

export const apiFetchDefinition: WidgetDefinition<ApiFetchProps> = {
  id: 'api-fetch',
  type: 'api-fetch',
  name: 'API Fetch',
  category: 'data',
  description: 'Fetches data from an API and stores results in Builder state',
  icon: '🔌',
  component: ApiFetchWidget,
  canHaveChildren: true,
  defaults: { method: 'GET', autoFetch: true, stateKey: 'data' },
  inputs: [
    { name: 'url', friendlyName: 'API URL', type: 'url', required: true, helperText: 'The endpoint to fetch data from' },
    { name: 'method', friendlyName: 'HTTP Method', type: 'string', defaultValue: 'GET', enum: ['GET', 'POST'] },
    { name: 'stateKey', friendlyName: 'State Key', type: 'string', defaultValue: 'data', helperText: 'Builder state key to store the response in' },
    { name: 'autoFetch', friendlyName: 'Auto Fetch', type: 'boolean', defaultValue: true, helperText: 'Fetch automatically on mount' },
    { name: 'loadingText', friendlyName: 'Loading Text', type: 'string', defaultValue: 'Loading...' },
    { name: 'errorText', friendlyName: 'Error Text', type: 'string', defaultValue: 'Failed to load data' },
  ],
  tags: ['data', 'api', 'fetch', 'http'],
};

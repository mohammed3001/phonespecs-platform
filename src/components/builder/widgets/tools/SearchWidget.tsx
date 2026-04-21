'use client';

// =============================================================================
// SearchWidget — Full search experience with autocomplete and results
// Category: Tools
// =============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { WidgetWrapper } from '@/components/builder/core/WidgetWrapper';
import type { WidgetDefinition, WidgetBaseProps } from '@/lib/builder/types';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  url?: string;
  image?: string;
}

interface SearchWidgetProps extends WidgetBaseProps {
  placeholder?: string;
  endpoint?: string;
  stateKey?: string;
  debounceMs?: number;
  minChars?: number;
  showSuggestions?: boolean;
  maxResults?: number;
  searchLabel?: string;
  noResultsText?: string;
}

function SearchWidget({
  placeholder = 'Search...',
  endpoint = '/api/search/autocomplete',
  stateKey = 'searchResults',
  debounceMs = 300,
  minChars = 2,
  showSuggestions = true,
  maxResults = 8,
  searchLabel = 'Search',
  noResultsText = 'No results found',
  attributes,
  builderState,
}: SearchWidgetProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minChars) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const url = `${endpoint}?q=${encodeURIComponent(searchQuery)}&limit=${maxResults}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Normalize response — handle both direct array and { results: [...] } shapes
        const items: SearchResult[] = Array.isArray(data) ? data : (data.results ?? data.hits ?? []);
        setResults(items.slice(0, maxResults));

        if (builderState?.setState) {
          builderState.setState({ [stateKey]: items });
        }

        setIsOpen(showSuggestions && items.length > 0);
      } catch {
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, minChars, maxResults, showSuggestions, stateKey, builderState]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = e.target.value;
      setQuery(newQuery);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => performSearch(newQuery), debounceMs);
    },
    [debounceMs, performSearch]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        performSearch(query);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    },
    [query, performSearch]
  );

  return (
    <WidgetWrapper attributes={attributes} testId="widget-search">
      <div ref={wrapperRef} className="relative w-full">
        {/* Search Label */}
        {searchLabel && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {searchLabel}
          </label>
        )}

        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="search"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder={placeholder}
            className="
              w-full pl-10 pr-4 py-3 text-base
              rounded-xl border border-gray-300 dark:border-slate-600
              bg-white dark:bg-slate-800
              text-gray-900 dark:text-gray-100
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
              dark:focus:ring-offset-slate-900
              transition-all duration-200
            "
          />
          {isLoading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {isOpen && showSuggestions && (
          <div className="
            absolute z-50 mt-1 w-full
            bg-white dark:bg-slate-800
            border border-gray-200 dark:border-slate-700
            rounded-xl shadow-lg
            max-h-80 overflow-y-auto
          ">
            {results.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                {noResultsText}
              </div>
            ) : (
              <ul className="py-1">
                {results.map((result, index) => (
                  <li key={result.id ?? index}>
                    <a
                      href={result.url ?? '#'}
                      className="
                        flex items-center gap-3 px-4 py-3
                        hover:bg-gray-50 dark:hover:bg-slate-700
                        transition-colors duration-150
                      "
                      onClick={() => setIsOpen(false)}
                    >
                      {result.image && (
                        <img
                          src={result.image}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-slate-700"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {result.title}
                        </p>
                        {result.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {result.description}
                          </p>
                        )}
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </WidgetWrapper>
  );
}

export const searchWidgetDefinition: WidgetDefinition<SearchWidgetProps> = {
  id: 'search-widget',
  type: 'search-widget',
  name: 'Search Widget',
  category: 'tools',
  description: 'Full search experience with autocomplete, debounce, and results dropdown',
  icon: '🔍',
  component: SearchWidget,
  canHaveChildren: false,
  defaults: { endpoint: '/api/search/autocomplete', debounceMs: 300, minChars: 2, maxResults: 8 },
  inputs: [
    { name: 'placeholder', type: 'string', defaultValue: 'Search...' },
    { name: 'endpoint', friendlyName: 'API Endpoint', type: 'url', defaultValue: '/api/search/autocomplete', helperText: 'Search API URL (receives ?q= query param)' },
    { name: 'stateKey', friendlyName: 'State Key', type: 'string', defaultValue: 'searchResults', helperText: 'Builder state key to store results' },
    { name: 'debounceMs', friendlyName: 'Debounce (ms)', type: 'number', defaultValue: 300 },
    { name: 'minChars', friendlyName: 'Min Characters', type: 'number', defaultValue: 2 },
    { name: 'showSuggestions', friendlyName: 'Show Suggestions', type: 'boolean', defaultValue: true },
    { name: 'maxResults', friendlyName: 'Max Results', type: 'number', defaultValue: 8 },
    { name: 'searchLabel', friendlyName: 'Label', type: 'string', defaultValue: 'Search' },
    { name: 'noResultsText', friendlyName: 'No Results Text', type: 'string', defaultValue: 'No results found' },
  ],
  tags: ['tools', 'search', 'autocomplete', 'meilisearch'],
};

'use client';

import { Icon } from '@iconify/react';
import { brands } from '@/data/mock-phones';
import type { SearchFilters } from '@/types/phone';

interface SearchFiltersProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  onClose?: () => void;
}

const RAM_OPTIONS = ['4GB', '6GB', '8GB', '12GB', '16GB'];
const STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB'];
const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'AVAILABLE', label: 'In Stock' },
  { value: 'UPCOMING', label: 'Coming Soon' },
  { value: 'DISCONTINUED', label: 'Discontinued' },
];

export function SearchFiltersPanel({ filters, onFilterChange, onClose }: SearchFiltersProps) {
  const updateFilter = (key: keyof SearchFilters, value: string | number | undefined) => {
    onFilterChange({ ...filters, [key]: value || undefined });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Icon icon="mdi:filter-variant" width={20} />
          Filters
        </h3>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 text-gray-500">
            <Icon icon="mdi:close" width={20} />
          </button>
        )}
      </div>

      {/* Brand filter */}
      <div>
        <label className="form-label">Brand</label>
        <select
          value={filters.brand || ''}
          onChange={(e) => updateFilter('brand', e.target.value)}
          className="admin-input"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.slug}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Price range */}
      <div>
        <label className="form-label">Price Range (USD)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin || ''}
            onChange={(e) => updateFilter('priceMin', e.target.value ? Number(e.target.value) : undefined)}
            className="admin-input"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax || ''}
            onChange={(e) => updateFilter('priceMax', e.target.value ? Number(e.target.value) : undefined)}
            className="admin-input"
          />
        </div>
      </div>

      {/* RAM */}
      <div>
        <label className="form-label">RAM</label>
        <div className="flex flex-wrap gap-1.5">
          {RAM_OPTIONS.map((ram) => (
            <button
              key={ram}
              onClick={() => updateFilter('ram', filters.ram === ram ? undefined : ram)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filters.ram === ram
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {ram}
            </button>
          ))}
        </div>
      </div>

      {/* Storage */}
      <div>
        <label className="form-label">Storage</label>
        <div className="flex flex-wrap gap-1.5">
          {STORAGE_OPTIONS.map((storage) => (
            <button
              key={storage}
              onClick={() => updateFilter('storage', filters.storage === storage ? undefined : storage)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filters.storage === storage
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {storage}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="form-label">Status</label>
        <select
          value={filters.status || ''}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="admin-input"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Clear */}
      <button
        onClick={() => onFilterChange({})}
        className="btn-secondary w-full justify-center"
      >
        <Icon icon="mdi:filter-remove" width={16} />
        Clear All Filters
      </button>
    </div>
  );
}

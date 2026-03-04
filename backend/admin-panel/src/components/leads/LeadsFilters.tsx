'use client';

import type { GetLeadsFilters } from '@/src/services/leadsService';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'replied', label: 'Replied' },
  { value: 'diagnostic_completed', label: 'Diagnostic completed' },
  { value: 'proposal_sent', label: 'Proposal sent' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'converted', label: 'Converted' },
];

interface LeadsFiltersProps {
  filters: GetLeadsFilters;
  onFiltersChange: (filters: GetLeadsFilters) => void;
  onRefresh: () => void;
  refreshing?: boolean;
}

export default function LeadsFilters({
  filters,
  onFiltersChange,
  onRefresh,
  refreshing = false,
}: LeadsFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-w-0">
          <div>
            <label htmlFor="leads-filter-status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="leads-filter-status"
              value={filters.status ?? ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, status: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="">All</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="leads-filter-city" className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              id="leads-filter-city"
              type="text"
              value={filters.city ?? ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, city: e.target.value || undefined })
              }
              placeholder="Filter by city"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="leads-filter-category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <input
              id="leads-filter-category"
              type="text"
              value={filters.category ?? ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, category: e.target.value || undefined })
              }
              placeholder="Filter by category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="px-4 py-2 rounded-md bg-gray-900 text-white font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
}

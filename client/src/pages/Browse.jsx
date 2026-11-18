import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { getItems } from '../api/items.api';
import { ItemCard } from '../components/items/ItemCard';
import { CategoryChips } from '../components/ui/CategoryChips';
import { ZoneSelect } from '../components/ui/ZoneSelect';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { EmptyState } from '../components/ui/EmptyState';

export const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const type = searchParams.get('type') || '';
  const category = searchParams.get('category') || '';
  const zone = searchParams.get('zone') || '';
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(q);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('q', searchInput.trim());
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const { data, isLoading } = useQuery({
    queryKey: ['items', { type, category, zone, q, page }],
    queryFn: () =>
      getItems({
        type: type || undefined,
        category: category || undefined,
        zone: zone || undefined,
        q: q || undefined,
        page,
        limit: 12,
        sort: 'newest'
      })
  });

  const items = data?.data?.items || [];
  const meta = data?.meta || { total: 0, totalPages: 1, page: 1 };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Browse Campus Items
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Explore lost items and reported found objects across campus locations.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Type Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Lost / Found / All Tabs */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => updateParam('type', '')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                !type
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Items
            </button>
            <button
              type="button"
              onClick={() => updateParam('type', 'lost')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                type === 'lost'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Lost Only
            </button>
            <button
              type="button"
              onClick={() => updateParam('type', 'found')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                type === 'found'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Found Only
            </button>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-xs">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search keyword..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>
        </div>

        {/* Zone & Clear */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-64">
            <ZoneSelect
              value={zone}
              onChange={(z) => updateParam('zone', z)}
              placeholder="All Campus Zones"
            />
          </div>

          {(type || category || zone || q) && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Category Chips */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <CategoryChips
            selected={category}
            onSelect={(cat) => updateParam('category', cat)}
          />
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <ItemCard key={item._id || item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No items found"
          description="Try selecting a different campus zone, category, or clear search filters."
          action={
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
            >
              Clear Filters
            </button>
          }
        />
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500">
            Showing Page <span className="font-bold">{meta.page}</span> of{' '}
            <span className="font-bold">{meta.totalPages}</span> ({meta.total} total items)
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => updateParam('page', String(page - 1))}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= meta.totalPages}
              onClick={() => updateParam('page', String(page + 1))}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, AlertTriangle, CheckCircle2, PackageSearch } from 'lucide-react';
import { getMyItems } from '../api/items.api';
import { ItemCard } from '../components/items/ItemCard';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { EmptyState } from '../components/ui/EmptyState';

export const MyItems = () => {
  const [tab, setTab] = useState('all'); // 'all', 'lost', 'found'

  const { data, isLoading } = useQuery({
    queryKey: ['items', 'mine'],
    queryFn: getMyItems
  });

  const allItems = data?.data?.items || [];
  const filteredItems = allItems.filter((item) => {
    if (tab === 'lost') return item.type === 'lost';
    if (tab === 'found') return item.type === 'found';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Reported Items
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track and manage your lost and found submissions across campus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/report/lost"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report Lost</span>
          </Link>
          <Link
            to="/report/found"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Report Found</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          type="button"
          onClick={() => setTab('all')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            tab === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          All ({allItems.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('lost')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            tab === 'lost'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Lost ({allItems.filter((i) => i.type === 'lost').length})
        </button>
        <button
          type="button"
          onClick={() => setTab('found')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            tab === 'found'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Found ({allItems.filter((i) => i.type === 'found').length})
        </button>
      </div>

      {/* List / Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ItemCard key={item._id || item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={`No ${tab !== 'all' ? tab : ''} reports yet`}
          description="Reports you submit for lost items or found items will appear here."
          action={
            <div className="flex gap-2">
              <Link
                to="/report/lost"
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold"
              >
                Report Lost Item
              </Link>
              <Link
                to="/report/found"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
              >
                Report Found Item
              </Link>
            </div>
          }
        />
      )}
    </div>
  );
};

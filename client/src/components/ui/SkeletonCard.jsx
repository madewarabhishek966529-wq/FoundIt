import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800 w-full" />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
        </div>
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
      </div>
    </div>
  );
};

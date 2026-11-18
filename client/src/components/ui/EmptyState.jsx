import React from 'react';
import { PackageSearch } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = PackageSearch,
  title = 'No items found',
  description = 'Try adjusting your filters or search keywords.',
  action = null
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 my-6">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-5">
        {description}
      </p>
      {action}
    </div>
  );
};

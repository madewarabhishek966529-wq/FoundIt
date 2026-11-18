import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ShieldCheck, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { StatusBadge } from '../ui/StatusBadge';

export const ItemCard = ({ item }) => {
  const hasImage = item.images && item.images.length > 0;
  const isFound = item.type === 'found';
  const isIdCard = item.category === 'id-card';

  // Format relative time safely
  let timeAgo = '';
  try {
    timeAgo = formatDistanceToNow(new Date(item.dateEvent), { addSuffix: true });
  } catch {
    timeAgo = 'Recently';
  }

  return (
    <Link
      to={`/items/${item._id || item.id}`}
      className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col"
    >
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {hasImage ? (
          <img
            src={item.images[0].url}
            alt={item.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              isIdCard ? 'blur-md hover:blur-none transition-all' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Tag className="w-12 h-12 stroke-[1.2]" />
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm ${
              isFound
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 text-white'
            }`}
          >
            {isFound ? 'Found' : 'Lost'}
          </span>
        </div>

        {/* Security desk pill */}
        {item.heldAtDesk && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white p-1 rounded-md shadow-sm" title="Held at Security Desk">
            <ShieldCheck className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 capitalize">
              {item.category}
            </span>
            <StatusBadge status={item.status} />
          </div>

          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {item.title}
          </h3>

          {item.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
              {item.description}
            </p>
          )}
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate max-w-[120px]">{item.zone}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

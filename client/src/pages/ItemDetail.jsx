import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  Calendar,
  ShieldCheck,
  Tag,
  User,
  Trash2,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { getItemById, deleteItem } from '../api/items.api';
import { useAuthStore } from '../store/authStore';
import { StatusBadge } from '../components/ui/StatusBadge';

export const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['item', id],
    queryFn: () => getItemById(id)
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      navigate('/my-items');
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-500">
        Loading item details...
      </div>
    );
  }

  if (error || !data?.data?.item) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Item not found</h2>
        <p className="text-sm text-slate-500">The item you are looking for does not exist or was removed.</p>
        <Link to="/browse" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">
          Back to Browse
        </Link>
      </div>
    );
  }

  const item = data.data.item;
  const isOwner = user && item.reporter && item.reporter.id === user.id;
  const isAdmin = user && user.role === 'admin';
  const isFound = item.type === 'found';
  const hasImages = item.images && item.images.length > 0;

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {(isOwner || isAdmin) && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this report?')) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Report</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Left Column: Photos Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 relative">
            {hasImages ? (
              <img
                src={item.images[activeImageIndex]?.url}
                alt={item.title}
                className={`w-full h-full object-cover ${
                  item.category === 'id-card' && !isOwner && !isAdmin ? 'blur-md' : ''
                }`}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <Tag className="w-16 h-16 stroke-[1.2] mb-2" />
                <span className="text-xs">No photo provided for this report</span>
              </div>
            )}

            <div className="absolute top-3 left-3">
              <span
                className={`px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider ${
                  isFound ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                }`}
              >
                {isFound ? 'Found Item' : 'Lost Item'}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {hasImages && item.images.length > 1 && (
            <div className="flex gap-2">
              {item.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx
                      ? 'border-blue-600 scale-105'
                      : 'border-slate-200 dark:border-slate-700 opacity-70'
                  }`}
                >
                  <img src={img.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {item.category}
              </span>
              <StatusBadge status={item.status} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {item.title}
            </h1>

            {item.description && (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            )}

            {/* Key Metadata Table */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400">Campus Zone</span>
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>{item.zone}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400">Date {isFound ? 'Found' : 'Lost'}</span>
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>
                    {(() => {
                      try {
                        return format(new Date(item.dateEvent), 'PPP');
                      } catch {
                        return 'Unknown';
                      }
                    })()}
                  </span>
                </div>
              </div>

              {item.color && (
                <div className="space-y-1">
                  <span className="text-slate-400">Color</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{item.color}</p>
                </div>
              )}

              {item.brand && (
                <div className="space-y-1">
                  <span className="text-slate-400">Brand</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{item.brand}</p>
                </div>
              )}
            </div>

            {/* Security Desk Notice */}
            {item.heldAtDesk && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Held at Security Desk:</strong> Verified owners can collect this item directly from campus security.
                </span>
              </div>
            )}

            {/* Reporter Info (Privacy Compliant) */}
            {item.reporter && (
              <div className="flex items-center gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
                <User className="w-4 h-4 text-slate-400" />
                <span>
                  Reported by <strong>{item.reporter.firstName}</strong>
                  {item.reporter.department ? ` (${item.reporter.department})` : ''}
                </span>
              </div>
            )}
          </div>

          {/* Action button: Claim (Phase 3) or Match notification */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
            {isFound && !isOwner && item.status === 'open' && (
              <button
                type="button"
                onClick={() => alert('Claim flow with hidden detail verification is coming in Phase 3!')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>This is mine (Claim Item)</span>
              </button>
            )}

            {isOwner && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-600 dark:text-slate-300">
                You reported this item. Our neural matching engine automatically links it with opposite reports.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

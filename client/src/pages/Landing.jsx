import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Camera
} from 'lucide-react';
import { getItems } from '../api/items.api';
import { ItemCard } from '../components/items/ItemCard';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { SearchByImageModal } from '../components/ui/SearchByImageModal';

export const Landing = () => {
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['items', 'recent-found'],
    queryFn: () => getItems({ type: 'found', limit: 4, sort: 'newest' })
  });

  const recentFoundItems = data?.data?.items || [];

  return (
    <div className="space-y-16 py-6">
      {/* Search by Image Modal */}
      <SearchByImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
      />

      {/* Hero Section */}
      <section className="relative text-center max-w-3xl mx-auto space-y-6 pt-6 pb-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered Campus Lost & Found Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Reuniting you with what matters on <span className="text-blue-600 dark:text-blue-400">Campus</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Snap a photo of an item you found, or report something you lost. Our CLIP multimodal neural network matches visual and text details instantly.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/report/lost"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/25 transition-all text-base"
          >
            <AlertTriangle className="w-5 h-5" />
            <span>I Lost Something</span>
          </Link>
          <Link
            to="/report/found"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 transition-all text-base"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>I Found Something</span>
          </Link>
          <button
            type="button"
            onClick={() => setImageModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 shadow-sm transition-all text-base"
          >
            <Camera className="w-5 h-5" />
            <span>Search by Photo</span>
          </button>
        </div>

        {/* Quick Search Shortcut */}
        <div className="pt-4 max-w-xl mx-auto">
          <Link
            to="/browse"
            className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-blue-400 dark:hover:border-blue-600 transition-all text-slate-400 text-sm group"
          >
            <Search className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors ml-1" />
            <span className="flex-1 text-left text-slate-500 dark:text-slate-400">
              Search by title, description, category, or campus zone...
            </span>
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold">
              Browse
            </span>
          </Link>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Visual & Text AI Matching</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            CLIP 512-dimensional vector embeddings match photos of found items to descriptive lost reports with ranked confidence scores.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Anti-Fraud Verification</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Finders can set hidden verification questions (e.g. wallpaper or engraved detail) to prevent fraudulent claims before handover.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Campus Security Desk Workflow</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Security desk admin portal allows custodians to hold physical items, verify IDs, approve claims, and maintain audited handover logs.
          </p>
        </div>
      </section>

      {/* Recent Found Items Preview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Recently Found on Campus
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Items found across campus buildings and departments.
            </p>
          </div>
          <Link
            to="/browse?type=found"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>View all</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : recentFoundItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recentFoundItems.map((item) => (
              <ItemCard key={item._id || item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500">No found items reported yet.</p>
          </div>
        )}
      </section>
    </div>
  );
};

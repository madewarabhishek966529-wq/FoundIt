import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Sparkles,
  EyeOff,
  CheckCircle2,
  Tag,
  ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';

export const MatchCard = ({ match, currentItemType = 'lost', onDismiss = null, onClaim = null }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  // If current item is lost, the candidate to inspect is foundItem, and vice versa
  const candidate = currentItemType === 'lost' ? match.foundItem : match.lostItem;
  if (!candidate) return null;

  const scorePct = Math.round((match.score || 0) * 100);
  const confidence = match.confidence || 'low';

  const confidenceBadge = {
    high: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300',
    low: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300'
  }[confidence];

  const breakdown = match.breakdown || { image: 0, text: 0, location: 0, time: 0 };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all space-y-4">
      {/* Top Header: Score & Confidence */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-base shadow-md shadow-blue-500/20">
            {scorePct}%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Match Confidence
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${confidenceBadge}`}>
                {confidence}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Ranked via CLIP multimodal embedding
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={() => onDismiss(match._id || match.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Dismiss suggestion"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Candidate Item Summary */}
      <div className="flex gap-4 p-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800/80">
        <div className="w-20 h-20 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 relative">
          {candidate.images && candidate.images.length > 0 ? (
            <img
              src={candidate.images[0].url}
              alt={candidate.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <Tag className="w-6 h-6" />
            </div>
          )}
          {candidate.heldAtDesk && (
            <div className="absolute top-1 right-1 bg-blue-600 text-white p-0.5 rounded" title="Held at Security Desk">
              <ShieldCheck className="w-3 h-3" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {candidate.category}
            </span>
            <span className="text-[11px] text-slate-400">
              {candidate.dateEvent ? format(new Date(candidate.dateEvent), 'MMM d, yyyy') : ''}
            </span>
          </div>

          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
            {candidate.title}
          </h4>

          {candidate.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {candidate.description}
            </p>
          )}

          <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-0.5">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span className="truncate">{candidate.zone}</span>
          </div>
        </div>
      </div>

      {/* Expandable Score Breakdown */}
      <div>
        <button
          type="button"
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Score Breakdown</span>
          </span>
          {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showBreakdown && (
          <div className="mt-3 space-y-2.5 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 text-xs">
            {/* Image Score Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Visual Image Match</span>
                <span className="font-bold">{Math.round(breakdown.image * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${Math.round(breakdown.image * 100)}%` }}
                />
              </div>
            </div>

            {/* Text Score Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Text & Keyword Match</span>
                <span className="font-bold">{Math.round(breakdown.text * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all"
                  style={{ width: `${Math.round(breakdown.text * 100)}%` }}
                />
              </div>
            </div>

            {/* Location Score Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Location / Zone Proximity</span>
                <span className="font-bold">{Math.round(breakdown.location * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all"
                  style={{ width: `${Math.round(breakdown.location * 100)}%` }}
                />
              </div>
            </div>

            {/* Time Decay Score Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Time Window Decay</span>
                <span className="font-bold">{Math.round(breakdown.time * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-600 rounded-full transition-all"
                  style={{ width: `${Math.round(breakdown.time * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 pt-1">
        <Link
          to={`/items/${candidate._id || candidate.id}`}
          className="flex-1 py-2 text-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
        >
          View Candidate
        </Link>

        {currentItemType === 'lost' && (
          <button
            type="button"
            onClick={() => onClaim ? onClaim(match) : null}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/20 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>This is Mine</span>
          </button>
        )}
      </div>
    </div>
  );
};

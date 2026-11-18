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
  AlertTriangle,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { getItemById, deleteItem } from '../api/items.api';
import { getItemMatches, dismissMatch } from '../api/matches.api';
import { useAuthStore } from '../store/authStore';
import { StatusBadge } from '../components/ui/StatusBadge';
import { MatchCard } from '../components/matches/MatchCard';
import { ClaimModal } from '../components/claims/ClaimModal';
import { ItemQRCodeModal } from '../components/ui/ItemQRCodeModal';

export const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [activeClaimMatch, setActiveClaimMatch] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Fetch item details
  const { data: itemData, isLoading: itemLoading, error } = useQuery({
    queryKey: ['item', id],
    queryFn: () => getItemById(id)
  });

  const item = itemData?.data?.item;
  const isOwner = user && item?.reporter && item?.reporter.id === user.id;
  const isAdmin = user && user.role === 'admin';

  // Fetch matches if owner or admin
  const { data: matchesData, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches', id],
    queryFn: () => getItemMatches(id),
    enabled: Boolean(isOwner || isAdmin),
    refetchInterval: (query) => {
      // Poll every 3 seconds if embedding is still pending
      const status = query.state.data?.data?.embeddingStatus;
      return status === 'pending' ? 3000 : false;
    }
  });

  const matches = matchesData?.data?.matches || [];
  const embeddingStatus = matchesData?.data?.embeddingStatus || item?.embeddingStatus;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      navigate('/my-items');
    }
  });

  // Dismiss match mutation
  const dismissMutation = useMutation({
    mutationFn: (matchId) => dismissMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches', id] });
    }
  });

  if (itemLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-500">
        Loading item details...
      </div>
    );
  }

  if (error || !item) {
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

  const isFound = item.type === 'found';
  const hasImages = item.images && item.images.length > 0;

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-8">
      {/* Claim Modal */}
      <ClaimModal
        isOpen={claimModalOpen}
        onClose={() => {
          setClaimModalOpen(false);
          setActiveClaimMatch(null);
        }}
        foundItem={activeClaimMatch ? activeClaimMatch.foundItem : (isFound ? item : null)}
        lostItemId={activeClaimMatch ? activeClaimMatch.lostItem?._id : (!isFound ? item._id : null)}
        matchId={activeClaimMatch ? (activeClaimMatch._id || activeClaimMatch.id) : null}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['item', id] });
          queryClient.invalidateQueries({ queryKey: ['matches', id] });
          navigate('/claims');
        }}
      />

      {/* QR Code Modal */}
      <ItemQRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        item={item}
      />

      {/* Top Bar */}
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

      {/* Main Item Presentation Card */}
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

            {/* Key Metadata Grid */}
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
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs gap-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Held at Security Desk:</strong> Verified owners can collect this item directly from campus security.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setQrModalOpen(true)}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] shrink-0 transition-colors"
                >
                  View QR Tag
                </button>
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

          {/* Action button: Claim (Phase 3) */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
            {isFound && !isOwner && item.status === 'open' && (
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    navigate('/login');
                  } else {
                    setActiveClaimMatch(null);
                    setClaimModalOpen(true);
                  }
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>This is mine (Claim Item)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Owner Match Section (Phase 2 core) */}
      {(isOwner || isAdmin) && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Ranked Matches ({matches.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Computed via CLIP 512-dim visual and keyword embeddings
                </p>
              </div>
            </div>

            {embeddingStatus === 'pending' && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-semibold animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Vector Embedding...</span>
              </div>
            )}
          </div>

          {matchesLoading ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Loading match suggestions...
            </div>
          ) : matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((match) => (
                <MatchCard
                  key={match._id || match.id}
                  match={match}
                  currentItemType={item.type}
                  onDismiss={(matchId) => dismissMutation.mutate(matchId)}
                  onClaim={(m) => {
                    setActiveClaimMatch(m);
                    setClaimModalOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No matching {isFound ? 'lost' : 'found'} items found yet
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Our matching pipeline automatically scores and links new opposite reports as they are submitted on campus.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

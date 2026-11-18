import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  MapPin,
  Check,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import {
  getMyClaims,
  getIncomingClaims,
  approveClaim,
  rejectClaim,
  cancelClaim
} from '../api/claims.api';
import { EmptyState } from '../components/ui/EmptyState';

export const Claims = () => {
  const [tab, setTab] = useState('incoming'); // 'incoming' or 'mine'
  const queryClient = useQueryClient();

  const { data: myData, isLoading: myLoading } = useQuery({
    queryKey: ['claims', 'mine'],
    queryFn: getMyClaims
  });

  const { data: incomingData, isLoading: incomingLoading } = useQuery({
    queryKey: ['claims', 'incoming'],
    queryFn: getIncomingClaims
  });

  const myClaims = myData?.data?.claims || [];
  const incomingClaims = incomingData?.data?.claims || [];

  const approveMutation = useMutation({
    mutationFn: (id) => approveClaim(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => rejectClaim(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelClaim(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    }
  });

  const handleReject = (claimId) => {
    const reason = window.prompt('Please enter the reason for rejecting this claim:');
    if (reason && reason.trim()) {
      rejectMutation.mutate({ id: claimId, reason: reason.trim() });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Item Claims & Verification
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review claims on items you found or track claims you submitted.
        </p>
      </div>

      {/* Tabs */}
      <div className="inline-flex p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          type="button"
          onClick={() => setTab('incoming')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            tab === 'incoming'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Incoming Claims ({incomingClaims.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('mine')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            tab === 'mine'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          My Claims ({myClaims.length})
        </button>
      </div>

      {/* Tab: Incoming Claims */}
      {tab === 'incoming' && (
        <div className="space-y-4">
          {incomingLoading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Loading incoming claims...
            </div>
          ) : incomingClaims.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingClaims.map((claim) => (
                <div
                  key={claim._id || claim.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>
                        Claimant: <strong>{claim.claimant?.name}</strong>{' '}
                        {claim.claimant?.department && `(${claim.claimant.department})`}
                      </span>
                    </div>
                    {getStatusBadge(claim.status)}
                  </div>

                  {/* Item info */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 flex gap-3">
                    {claim.foundItem?.images && claim.foundItem.images.length > 0 && (
                      <img
                        src={claim.foundItem.images[0].url}
                        alt={claim.foundItem.title}
                        className="w-14 h-14 object-cover rounded-lg"
                      />
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                        {claim.foundItem?.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {claim.foundItem?.zone}
                      </p>
                    </div>
                  </div>

                  {/* Verification Result */}
                  <div className="p-3 rounded-xl border space-y-1.5 text-xs bg-slate-50 dark:bg-slate-950/30">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold text-[11px]">
                        Anti-Fraud Verification Check:
                      </span>
                      {claim.answerCorrect ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <Check className="w-3.5 h-3.5" />
                          <span>Secret Answer Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Answer Did Not Match</span>
                        </span>
                      )}
                    </div>
                    {claim.answer && (
                      <p className="text-slate-700 dark:text-slate-300 text-xs">
                        <strong>Submitted Answer:</strong> "{claim.answer}"
                      </p>
                    )}
                    {claim.proofNote && (
                      <p className="text-slate-600 dark:text-slate-400 text-xs italic">
                        <strong>Proof Note:</strong> {claim.proofNote}
                      </p>
                    )}
                  </div>

                  {/* Action buttons if pending */}
                  {claim.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => approveMutation.mutate(claim._id || claim.id)}
                        disabled={approveMutation.isPending}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Claim</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(claim._id || claim.id)}
                        disabled={rejectMutation.isPending}
                        className="py-2 px-3 border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-xs font-bold transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No incoming claims"
              description="When other students recognize an item you found and submit ownership proof, their claim will appear here for your approval."
            />
          )}
        </div>
      )}

      {/* Tab: My Claims */}
      {tab === 'mine' && (
        <div className="space-y-4">
          {myLoading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Loading your claims...
            </div>
          ) : myClaims.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myClaims.map((claim) => (
                <div
                  key={claim._id || claim.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Claimed on{' '}
                      {claim.createdAt ? format(new Date(claim.createdAt), 'MMM d, yyyy') : ''}
                    </span>
                    {getStatusBadge(claim.status)}
                  </div>

                  {/* Found item details */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 flex gap-3">
                    {claim.foundItem?.images && claim.foundItem.images.length > 0 && (
                      <img
                        src={claim.foundItem.images[0].url}
                        alt={claim.foundItem.title}
                        className="w-14 h-14 object-cover rounded-lg"
                      />
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                        {claim.foundItem?.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {claim.foundItem?.zone}
                      </p>
                    </div>
                  </div>

                  {claim.status === 'approved' && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                      <strong>Claim Approved!</strong> You can now collect this item. If held at the security desk, please show your student ID.
                    </div>
                  )}

                  {claim.status === 'rejected' && claim.rejectReason && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
                      <strong>Rejection Reason:</strong> {claim.rejectReason}
                    </div>
                  )}

                  {claim.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => cancelMutation.mutate(claim._id || claim.id)}
                      disabled={cancelMutation.isPending}
                      className="w-full py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Cancel Claim
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No claims made yet"
              description="Claims you submit on found items will appear here with live status updates."
            />
          )}
        </div>
      )}
    </div>
  );
};

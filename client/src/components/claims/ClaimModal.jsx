import React, { useState } from 'react';
import { X, ShieldCheck, Loader2, HelpCircle, AlertCircle } from 'lucide-react';
import { submitClaim } from '../../api/claims.api';

export const ClaimModal = ({ isOpen, onClose, foundItem, lostItemId = null, matchId = null, onSuccess = null }) => {
  const [answer, setAnswer] = useState('');
  const [proofNote, setProofNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !foundItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await submitClaim({
        matchId: matchId || undefined,
        lostItemId: lostItemId || undefined,
        foundItemId: foundItem._id || foundItem.id,
        answer: answer.trim(),
        proofNote: proofNote.trim()
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          'Failed to submit claim. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Claim Verification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Anti-fraud ownership proof
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Item being claimed */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            {foundItem.images && foundItem.images.length > 0 && (
              <img
                src={foundItem.images[0].url}
                alt={foundItem.title}
                className="w-12 h-12 object-cover rounded-lg"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {foundItem.title}
              </p>
              <p className="text-[11px] text-slate-400">
                Found in {foundItem.zone}
              </p>
            </div>
          </div>

          {/* Verification Question if set by finder */}
          {foundItem.verificationQuestion && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 mb-1">
                  <HelpCircle className="w-4 h-4" />
                  <span>Finder's Verification Question:</span>
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                  "{foundItem.verificationQuestion}"
                </span>
              </label>
              <input
                type="text"
                required
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer (e.g. wallpaper color, engraving)..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-[10px] text-slate-400">
                Answers are normalized and verified securely. Maximum 3 attempts allowed.
              </p>
            </div>
          )}

          {/* Proof note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Additional Ownership Proof Note (Optional)
            </label>
            <textarea
              rows={3}
              value={proofNote}
              onChange={(e) => setProofNote(e.target.value)}
              placeholder="Provide any additional identifiers, receipt numbers, scratches, or contact details for handover..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Submit Claim for Approval</span>
          </button>
        </form>
      </div>
    </div>
  );
};

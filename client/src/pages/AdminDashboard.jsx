import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  Package,
  Layers,
  CheckCircle2,
  Clock,
  User,
  AlertTriangle,
  FileCheck,
  Search,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import {
  getStats,
  getDeskItems,
  getClaimsQueue,
  completeHandover,
  getHandoverLogs
} from '../api/admin.api';

export const AdminDashboard = () => {
  const [tab, setTab] = useState('desk'); // 'desk', 'claims', 'logs'
  const [selectedClaimForHandover, setSelectedClaimForHandover] = useState(null);
  const [idChecked, setIdChecked] = useState(false);
  const [handoverNote, setHandoverNote] = useState('');
  const queryClient = useQueryClient();

  // Queries
  const { data: statsData } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getStats
  });

  const { data: deskData, isLoading: deskLoading } = useQuery({
    queryKey: ['admin', 'desk-items'],
    queryFn: getDeskItems
  });

  const { data: claimsData, isLoading: claimsLoading } = useQuery({
    queryKey: ['admin', 'claims'],
    queryFn: () => getClaimsQueue('pending')
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['admin', 'handover-logs'],
    queryFn: () => getHandoverLogs(1)
  });

  const stats = statsData?.data || {
    openLostCount: 0,
    openFoundCount: 0,
    deskItemsCount: 0,
    claimedCount: 0,
    resolutionRate: 0
  };

  const deskItems = deskData?.data?.items || [];
  const claims = claimsData?.data?.claims || [];
  const logs = logsData?.data?.logs || [];

  // Handover mutation
  const handoverMutation = useMutation({
    mutationFn: (data) => completeHandover(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      setSelectedClaimForHandover(null);
      setIdChecked(false);
      setHandoverNote('');
    }
  });

  const handleHandoverSubmit = (e) => {
    e.preventDefault();
    if (!selectedClaimForHandover) return;
    handoverMutation.mutate({
      claimId: selectedClaimForHandover._id || selectedClaimForHandover.id,
      idChecked,
      note: handoverNote.trim()
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Security Desk Administration
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Custody tracking, ownership verification, and physical handover audit logs.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Open Lost Reports</span>
          <p className="text-2xl font-black text-amber-600">{stats.openLostCount}</p>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Open Found Items</span>
          <p className="text-2xl font-black text-emerald-600">{stats.openFoundCount}</p>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Held at Security Desk</span>
          <p className="text-2xl font-black text-blue-600">{stats.deskItemsCount}</p>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Resolution Rate</span>
          <p className="text-2xl font-black text-purple-600">{stats.resolutionRate}%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          type="button"
          onClick={() => setTab('desk')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            tab === 'desk'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Items at Desk ({deskItems.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('claims')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            tab === 'claims'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Pending Claims ({claims.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('logs')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            tab === 'logs'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Handover Audit Log ({logs.length})
        </button>
      </div>

      {/* Tab: Items Held At Security Desk */}
      {tab === 'desk' && (
        <div className="space-y-4">
          {deskLoading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Loading desk items...
            </div>
          ) : deskItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {deskItems.map((item) => (
                <div
                  key={item._id || item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3"
                >
                  <div className="aspect-[4/3] rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0].url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold">
                      In Custody
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Found in: {item.zone}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              No items currently in custody at the Security Desk.
            </div>
          )}
        </div>
      )}

      {/* Tab: Pending Claims Review */}
      {tab === 'claims' && (
        <div className="space-y-4">
          {claimsLoading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Loading claims queue...
            </div>
          ) : claims.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {claims.map((claim) => (
                <div
                  key={claim._id || claim.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Claimant: {claim.claimant?.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {claim.claimant?.email} • {claim.claimant?.department}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Pending Handover
                    </span>
                  </div>

                  {/* Item preview */}
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
                        Found in {claim.foundItem?.zone}
                      </p>
                    </div>
                  </div>

                  {/* Verification Answer & Notes */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl border space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Question: {claim.foundItem?.verificationQuestion || 'None'}
                      </span>
                      {claim.answerCorrect ? (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Correct
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Incorrect Answer
                        </span>
                      )}
                    </div>
                    {claim.answer && (
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>Student Answer:</strong> "{claim.answer}"
                      </p>
                    )}
                    {claim.proofNote && (
                      <p className="text-slate-600 dark:text-slate-400 italic">
                        <strong>Proof Note:</strong> {claim.proofNote}
                      </p>
                    )}
                  </div>

                  {/* Handover Action */}
                  <button
                    type="button"
                    onClick={() => setSelectedClaimForHandover(claim)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Verify ID & Complete Handover</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              No pending claims to review.
            </div>
          )}
        </div>
      )}

      {/* Tab: Handover Audit Log */}
      {tab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          {logsLoading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Loading audit logs...
            </div>
          ) : logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Handed Date</th>
                    <th className="p-4">Item</th>
                    <th className="p-4">Given To (Student)</th>
                    <th className="p-4">Security Officer</th>
                    <th className="p-4">ID Verified</th>
                    <th className="p-4">Audit Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {logs.map((log) => (
                    <tr key={log._id || log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                        {log.handedAt ? format(new Date(log.handedAt), 'PPP p') : 'Unknown'}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {log.foundItem?.title}
                        </span>
                        <span className="block text-[10px] text-slate-400 capitalize">
                          {log.foundItem?.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {log.givenTo?.name}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {log.givenTo?.email}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {log.handledBy?.name}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <Check className="w-3.5 h-3.5" /> ID Checked
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 italic">
                        {log.note || 'None'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No handovers logged yet.
            </div>
          )}
        </div>
      )}

      {/* Handover Completion Modal */}
      {selectedClaimForHandover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Complete Security Desk Handover
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              You are completing the handover of <strong>{selectedClaimForHandover.foundItem?.title}</strong> to student <strong>{selectedClaimForHandover.claimant?.name}</strong>.
            </p>

            <form onSubmit={handleHandoverSubmit} className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-900/40">
                <input
                  type="checkbox"
                  id="idChecked"
                  required
                  checked={idChecked}
                  onChange={(e) => setIdChecked(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 mt-0.5"
                />
                <label htmlFor="idChecked" className="text-xs text-slate-700 dark:text-slate-300 font-bold cursor-pointer">
                  I confirm that I have physically verified the student's campus College ID card.
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Audit / Handover Note
                </label>
                <input
                  type="text"
                  value={handoverNote}
                  onChange={(e) => setHandoverNote(e.target.value)}
                  placeholder="e.g. Student ID #CS2024-889 verified; signed logbook"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedClaimForHandover(null)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!idChecked || handoverMutation.isPending}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  {handoverMutation.isPending ? 'Logging...' : 'Confirm Handover'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

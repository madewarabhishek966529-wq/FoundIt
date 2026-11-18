import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Sparkles, ShieldCheck, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../../api/notifications.api';
import { useAuthStore } from '../../store/authStore';

export const NotificationBell = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: Boolean(user),
    refetchInterval: 15000 // Poll every 15s
  });

  const notifications = data?.data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  if (!user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-extrabold text-white bg-blue-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
            <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllMutation.mutate()}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length > 0 ? (
              notifications.map((n) => {
                let timeAgo = '';
                try {
                  timeAgo = formatDistanceToNow(new Date(n.createdAt), { addSuffix: true });
                } catch {
                  timeAgo = 'recently';
                }

                return (
                  <Link
                    key={n._id || n.id}
                    to={n.link || '#'}
                    onClick={() => {
                      if (!n.read) markReadMutation.mutate(n._id || n.id);
                      setOpen(false);
                    }}
                    className={`block p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      !n.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-normal">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {timeAgo}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No notifications right now.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

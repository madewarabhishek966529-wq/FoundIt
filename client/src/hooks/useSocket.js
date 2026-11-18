import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';

export const useSocket = () => {
  const { accessToken, user } = useAuthStore();
  const queryClient = useQueryClient();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!accessToken || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_API_URL
      ? new URL(import.meta.env.VITE_API_URL).origin
      : 'http://localhost:5000';

    const socket = io(socketUrl, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected to real-time events');
    });

    socket.on('match:new', (payload) => {
      console.log('[Socket] match:new received:', payload);
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    socket.on('claim:received', () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    socket.on('claim:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    socket.on('notification:new', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, user, queryClient]);

  return socketRef.current;
};

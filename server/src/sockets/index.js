import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || env.NODE_ENV === 'development' || origin === env.CLIENT_URL || origin.startsWith('http://localhost:')) {
          return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true
    }
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
      socket.userId = decoded.id || decoded._id;
      next();
    } catch {
      next(new Error('Invalid socket authentication token'));
    }
  });

  io.on('connection', (socket) => {
    // Join user-specific room
    const userRoom = `user:${socket.userId}`;
    socket.join(userRoom);
    console.log(`[Socket] User connected: ${socket.userId} joined room ${userRoom}`);

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};

/**
 * Emit event to a specific user
 */
export const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};

export const emitMatchNew = (userId, payload) => {
  emitToUser(userId, 'match:new', payload);
};

export const emitClaimReceived = (userId, payload) => {
  emitToUser(userId, 'claim:received', payload);
};

export const emitClaimUpdated = (userId, payload) => {
  emitToUser(userId, 'claim:updated', payload);
};

export const emitNotificationNew = (userId, notification) => {
  emitToUser(userId, 'notification:new', notification);
};

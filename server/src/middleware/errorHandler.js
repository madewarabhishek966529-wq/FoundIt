import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let details = null;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Database validation error';
    details = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
  } else if (err.code === 11000) {
    // Mongo duplicate key error
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  } else if (err.message) {
    message = err.message;
  }

  // Log in non-test environment
  if (env.NODE_ENV !== 'test' && statusCode >= 500) {
    console.error(`[Error] ${statusCode} - ${message}:`, err);
  }

  const response = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  };

  res.status(statusCode).json(response);
};

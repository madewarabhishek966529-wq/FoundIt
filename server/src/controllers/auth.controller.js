import { env } from '../config/env.js';
import {
  registerUser,
  loginUser,
  refreshAuthTokens
} from '../services/auth.service.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const register = async (req, res) => {
  const result = await registerUser(req.body);
  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
  res.status(201).json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken
    }
  });
};

export const login = async (req, res) => {
  const result = await loginUser(req.body);
  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
  res.status(200).json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken
    }
  });
};

export const refresh = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const tokens = await refreshAuthTokens(token);
  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);
  res.status(200).json({
    success: true,
    data: {
      accessToken: tokens.accessToken
    }
  });
};

export const logout = async (req, res) => {
  res.clearCookie('refreshToken', COOKIE_OPTIONS);
  res.status(200).json({
    success: true,
    data: { message: 'Logged out successfully' }
  });
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        department: req.user.department
      }
    }
  });
};

import { z } from 'zod';
import { env } from '../config/env.js';

const emailValidation = z
  .string()
  .email('Please enter a valid email address')
  .toLowerCase()
  .refine(
    (email) => {
      if (!env.ALLOWED_EMAIL_DOMAIN || env.ALLOWED_EMAIL_DOMAIN === '*') {
        return true;
      }
      return email.endsWith(`@${env.ALLOWED_EMAIL_DOMAIN}`);
    },
    {
      message: `Registration is restricted to emails ending with @${env.ALLOWED_EMAIL_DOMAIN}`
    }
  );

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: emailValidation,
    password: z.string().min(8, 'Password must be at least 8 characters'),
    department: z.string().optional(),
    phone: z.string().optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address').toLowerCase(),
    password: z.string().min(1, 'Password is required')
  })
});

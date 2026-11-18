import { z } from 'zod';
import { CATEGORIES, CAMPUS_ZONES } from '../models/Item.js';

export const createItemSchema = z.object({
  body: z.object({
    type: z.enum(['lost', 'found'], { required_error: 'Type must be lost or found' }),
    title: z.string().min(2, 'Title must be at least 2 characters').max(100),
    description: z.string().max(1000).optional().default(''),
    category: z.enum(CATEGORIES, { required_error: 'Valid category is required' }),
    zone: z.string().min(1, 'Campus zone is required'),
    dateEvent: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format'
    }),
    color: z.string().optional(),
    brand: z.string().optional(),
    heldAtDesk: z
      .union([z.boolean(), z.string().transform((val) => val === 'true')])
      .optional()
      .default(false),
    verificationQuestion: z.string().max(200).optional(),
    verificationAnswer: z.string().max(200).optional(),
    lat: z
      .union([z.number(), z.string().transform(Number)])
      .optional(),
    lng: z
      .union([z.number(), z.string().transform(Number)])
      .optional()
  })
});

export const updateItemSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid item ID')
  }),
  body: z.object({
    title: z.string().min(2).max(100).optional(),
    description: z.string().max(1000).optional(),
    category: z.enum(CATEGORIES).optional(),
    zone: z.string().optional(),
    dateEvent: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' })
      .optional(),
    color: z.string().optional(),
    brand: z.string().optional()
  })
});

export const queryItemsSchema = z.object({
  query: z.object({
    type: z.enum(['lost', 'found']).optional(),
    category: z.enum(CATEGORIES).optional(),
    zone: z.string().optional(),
    status: z.enum(['open', 'matched', 'claimed', 'closed', 'expired']).optional(),
    q: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? Math.min(50, Math.max(1, parseInt(val, 10))) : 12)),
    sort: z.enum(['newest', 'oldest', 'dateEvent']).optional().default('newest')
  })
});

export const itemIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid item ID')
  })
});

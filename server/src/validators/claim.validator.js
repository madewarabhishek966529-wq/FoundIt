import { z } from 'zod';

export const createClaimSchema = z.object({
  body: z.object({
    matchId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid match ID').optional(),
    lostItemId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid lost item ID').optional(),
    foundItemId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid found item ID').optional(),
    answer: z.string().max(200).optional().default(''),
    proofNote: z.string().max(1000).optional().default('')
  }).refine((data) => data.matchId || (data.lostItemId && data.foundItemId), {
    message: 'Either matchId or both lostItemId and foundItemId must be provided'
  })
});

export const rejectClaimSchema = z.object({
  body: z.object({
    reason: z.string().min(2, 'Reason is required').max(500)
  })
});

export const claimIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid claim ID')
  })
});

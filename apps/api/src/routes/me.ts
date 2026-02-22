import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { profiles } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

function toProfile(p: typeof profiles.$inferSelect) {
  return {
    id: p.id,
    displayName: p.displayName ?? null,
    accountType: p.accountType,
    phone: p.phone ?? null,
    companyName: p.companyName ?? null,
    avatarUrl: p.avatarUrl ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

/** Get my profile (create placeholder if missing). */
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const rows = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  let p = rows[0];
  if (!p) {
    try {
      await db.insert(profiles).values({
        id: userId,
        accountType: 'individual',
      });
      console.log('[me] Profile created for user', userId);
    } catch (err) {
      console.error('[me] Failed to create profile:', err);
      res.status(500).json({ error: 'Failed to create profile' });
      return;
    }
    const again = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
    p = again[0];
  }
  if (!p) {
    res.status(500).json({ error: 'Failed to load profile' });
    return;
  }
  res.json(toProfile(p));
});

/** Create or update my profile (e.g. after sign up with account type + phone). */
router.patch('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const body = req.body as Record<string, unknown>;
  const displayName = typeof body.displayName === 'string' ? body.displayName : undefined;
  const accountType = body.accountType === 'company' || body.accountType === 'individual' ? body.accountType : undefined;
  const phone = typeof body.phone === 'string' ? body.phone : undefined;
  const companyName = typeof body.companyName === 'string' ? body.companyName : undefined;
  const avatarUrl = typeof body.avatarUrl === 'string' ? body.avatarUrl : undefined;

  const rows = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  const existing = rows[0];

  if (!existing) {
    await db.insert(profiles).values({
      id: userId,
      accountType: accountType ?? 'individual',
      displayName: displayName ?? null,
      phone: phone ?? null,
      companyName: companyName ?? null,
      avatarUrl: avatarUrl ?? null,
    });
    const again = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
    const p = again[0];
    if (!p) {
      res.status(500).json({ error: 'Failed to create profile' });
      return;
    }
    res.json(toProfile(p));
    return;
  }

  const updates: Partial<typeof profiles.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (displayName !== undefined) updates.displayName = displayName;
  if (accountType !== undefined) updates.accountType = accountType;
  if (phone !== undefined) updates.phone = phone;
  if (companyName !== undefined) updates.companyName = companyName;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

  await db.update(profiles).set(updates).where(eq(profiles.id, userId));
  const updated = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  res.json(toProfile(updated[0]!));
});

export default router;

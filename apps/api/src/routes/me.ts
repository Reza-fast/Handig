import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { profiles, providers, companyPhotos } from '../db/schema.js';
import { eq, and, asc } from 'drizzle-orm';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

const router = Router();

function toProfile(p: typeof profiles.$inferSelect) {
  return {
    id: p.id,
    displayName: p.displayName ?? null,
    accountType: p.accountType,
    email: p.email ?? null,
    phone: p.phone ?? null,
    companyName: p.companyName ?? null,
    btwNumber: p.btwNumber ?? null,
    street: p.street ?? null,
    streetNumber: p.streetNumber ?? null,
    zipCode: p.zipCode ?? null,
    city: p.city ?? null,
    avatarUrl: p.avatarUrl ?? null,
    companyDescription: p.companyDescription ?? null,
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
  const email = typeof body.email === 'string' ? body.email : undefined;
  const phone = typeof body.phone === 'string' ? body.phone : undefined;
  const companyName = typeof body.companyName === 'string' ? body.companyName : undefined;
  const btwNumber = typeof body.btwNumber === 'string' ? body.btwNumber : undefined;
  const street = typeof body.street === 'string' ? body.street : undefined;
  const streetNumber = typeof body.streetNumber === 'string' ? body.streetNumber : undefined;
  const zipCode = typeof body.zipCode === 'string' ? body.zipCode : undefined;
  const city = typeof body.city === 'string' ? body.city : undefined;
  const avatarUrl = typeof body.avatarUrl === 'string' ? body.avatarUrl : undefined;
  const companyDescription = typeof body.companyDescription === 'string' ? body.companyDescription : undefined;

  const rows = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  const existing = rows[0];

  if (!existing) {
    await db.insert(profiles).values({
      id: userId,
      accountType: accountType ?? 'individual',
      displayName: displayName ?? null,
      email: email ?? null,
      phone: phone ?? null,
      companyName: companyName ?? null,
      btwNumber: btwNumber ?? null,
      street: street ?? null,
      streetNumber: streetNumber ?? null,
      zipCode: zipCode ?? null,
      city: city ?? null,
      avatarUrl: avatarUrl ?? null,
      companyDescription: companyDescription ?? null,
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
  if (email !== undefined) updates.email = email;
  if (phone !== undefined) updates.phone = phone;
  if (companyName !== undefined) updates.companyName = companyName;
  if (btwNumber !== undefined) updates.btwNumber = btwNumber;
  if (street !== undefined) updates.street = street;
  if (streetNumber !== undefined) updates.streetNumber = streetNumber;
  if (zipCode !== undefined) updates.zipCode = zipCode;
  if (city !== undefined) updates.city = city;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
  if (companyDescription !== undefined) updates.companyDescription = companyDescription;

  await db.update(profiles).set(updates).where(eq(profiles.id, userId));
  const updated = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  res.json(toProfile(updated[0]!));
});

/** List my company photos (for edit form). */
router.get('/company-photos', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const list = await db
    .select()
    .from(companyPhotos)
    .where(eq(companyPhotos.userId, userId))
    .orderBy(asc(companyPhotos.sortOrder));
  res.json(list.map((ph) => ({ id: ph.id, url: ph.url, sortOrder: ph.sortOrder })));
});

/** Add a company photo (company users only; check accountType in client). */
router.post('/company-photos', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const body = req.body as { url?: string };
  const url = typeof body?.url === 'string' ? body.url : undefined;
  if (!url) {
    res.status(400).json({ error: 'url is required' });
    return;
  }
  const existing = await db
    .select({ sortOrder: companyPhotos.sortOrder })
    .from(companyPhotos)
    .where(eq(companyPhotos.userId, userId));
  const maxOrder = existing.length === 0 ? -1 : Math.max(...existing.map((r) => r.sortOrder));
  const sortOrder = maxOrder + 1;
  await db.insert(companyPhotos).values({ userId, url, sortOrder });
  const inserted = await db
    .select()
    .from(companyPhotos)
    .where(eq(companyPhotos.userId, userId))
    .orderBy(asc(companyPhotos.sortOrder));
  res.status(201).json(inserted.map((ph) => ({ id: ph.id, url: ph.url, sortOrder: ph.sortOrder })));
});

/** Delete a company photo. */
router.delete('/company-photos/:photoId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const { photoId } = req.params;
  await db
    .delete(companyPhotos)
    .where(and(eq(companyPhotos.userId, userId), eq(companyPhotos.id, photoId)));
  res.status(204).send();
});

/** Delete my account (profile, providers, and auth user). Client must verify password before calling. */
router.delete('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  try {
    await db.delete(providers).where(eq(providers.userId, userId));
    await db.delete(profiles).where(eq(profiles.id, userId));
    if (!supabaseAdmin) {
      res.status(500).json({ error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY required to delete account' });
      return;
    }
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      console.error('[me] deleteUser failed:', error);
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error('[me] Account delete failed:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;

import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { profiles, companyPhotos } from '../db/schema.js';
import { eq, asc } from 'drizzle-orm';

const router = Router();

/** Public company page: only for users with accountType=company. */
router.get('/:userId', async (req, res: Response) => {
  const { userId } = req.params;
  const rows = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  const p = rows[0];
  if (!p || p.accountType !== 'company') {
    return res.status(404).json({ error: 'Company not found' });
  }
  res.json({
    id: p.id,
    companyName: p.companyName ?? null,
    companyDescription: p.companyDescription ?? null,
    street: p.street ?? null,
    streetNumber: p.streetNumber ?? null,
    zipCode: p.zipCode ?? null,
    city: p.city ?? null,
    email: p.email ?? null,
    phone: p.phone ?? null,
    avatarUrl: p.avatarUrl ?? null,
  });
});

/** Public company photos. */
router.get('/:userId/photos', async (req, res: Response) => {
  const { userId } = req.params;
  const list = await db
    .select()
    .from(companyPhotos)
    .where(eq(companyPhotos.userId, userId))
    .orderBy(asc(companyPhotos.sortOrder));
  res.json(list.map((ph) => ({ id: ph.id, url: ph.url, sortOrder: ph.sortOrder })));
});

export default router;

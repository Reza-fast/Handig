import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { providers, providerPhotos } from '../db/schema.js';
import { eq, and, asc } from 'drizzle-orm';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

const router = Router();

function toProviderJson(p: typeof providers.$inferSelect) {
  return {
    id: String(p.id),
    userId: p.userId ?? null,
    name: String(p.name),
    description: p.description == null ? null : String(p.description),
    categoryId: String(p.categoryId),
    serviceId: p.serviceId == null ? null : String(p.serviceId),
    address: p.address == null ? null : String(p.address),
    latitude: p.latitude == null ? null : Number(p.latitude),
    longitude: p.longitude == null ? null : Number(p.longitude),
    rating: p.rating == null ? null : Number(p.rating),
    imageUrl: p.imageUrl == null ? null : String(p.imageUrl),
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
  };
}

/** List providers owned by the current user. */
router.get('/my', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const list = await db.select().from(providers).where(eq(providers.userId, userId));
  res.json(list.map(toProviderJson));
});

/** Create a new provider listing (current user = owner). */
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const body = req.body as Record<string, unknown>;
  const name = typeof body.name === 'string' ? body.name : undefined;
  const categoryId = typeof body.categoryId === 'string' ? body.categoryId : undefined;
  const serviceId = typeof body.serviceId === 'string' ? body.serviceId : undefined;
  if (!name || !categoryId || !serviceId) {
    res.status(400).json({ error: 'name, categoryId, and serviceId are required' });
    return;
  }
  const description = typeof body.description === 'string' ? body.description : null;
  const address = typeof body.address === 'string' ? body.address : null;
  const id = randomUUID();
  await db.insert(providers).values({
    id,
    userId,
    name,
    categoryId,
    serviceId,
    description,
    address,
  });
  const rows = await db.select().from(providers).where(eq(providers.id, id)).limit(1);
  res.status(201).json(toProviderJson(rows[0]!));
});

/** Update a provider (only owner). */
router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const { id } = req.params;
  const rows = await db.select().from(providers).where(eq(providers.id, id)).limit(1);
  const p = rows[0];
  if (!p) {
    res.status(404).json({ error: 'Provider not found' });
    return;
  }
  if (p.userId !== userId) {
    res.status(403).json({ error: 'Not allowed to update this provider' });
    return;
  }
  const body = req.body as Record<string, unknown>;
  const updates: Partial<typeof providers.$inferInsert> = {};
  if (typeof body.name === 'string') updates.name = body.name;
  if (typeof body.description === 'string') updates.description = body.description;
  if (typeof body.address === 'string') updates.address = body.address;
  if (typeof body.imageUrl === 'string') updates.imageUrl = body.imageUrl;
  if (Object.keys(updates).length === 0) {
    res.json(toProviderJson(p));
    return;
  }
  await db.update(providers).set(updates).where(eq(providers.id, id));
  const updated = await db.select().from(providers).where(eq(providers.id, id)).limit(1);
  res.json(toProviderJson(updated[0]!));
});

/** List photos for a provider (public). */
router.get('/:id/photos', async (req, res) => {
  const { id } = req.params;
  const list = await db
    .select()
    .from(providerPhotos)
    .where(eq(providerPhotos.providerId, id))
    .orderBy(asc(providerPhotos.sortOrder));
  res.json(list.map((ph) => ({ id: ph.id, url: ph.url, sortOrder: ph.sortOrder })));
});

/** Add a photo to a provider (owner only). */
router.post('/:id/photos', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const { id: providerId } = req.params;
  const body = req.body as { url?: string };
  const url = typeof body?.url === 'string' ? body.url : undefined;
  if (!url) {
    res.status(400).json({ error: 'url is required' });
    return;
  }
  const providerRows = await db.select().from(providers).where(eq(providers.id, providerId)).limit(1);
  const provider = providerRows[0];
  if (!provider) {
    res.status(404).json({ error: 'Provider not found' });
    return;
  }
  if (provider.userId !== userId) {
    res.status(403).json({ error: 'Not allowed to add photos to this provider' });
    return;
  }
  const existing = await db
    .select({ sortOrder: providerPhotos.sortOrder })
    .from(providerPhotos)
    .where(eq(providerPhotos.providerId, providerId));
  const maxOrder = existing.length === 0 ? -1 : Math.max(...existing.map((r) => r.sortOrder));
  const sortOrder = maxOrder + 1;
  await db.insert(providerPhotos).values({ providerId, url, sortOrder });
  const inserted = await db
    .select()
    .from(providerPhotos)
    .where(eq(providerPhotos.providerId, providerId))
    .orderBy(asc(providerPhotos.sortOrder));
  res.status(201).json(inserted.map((ph) => ({ id: ph.id, url: ph.url, sortOrder: ph.sortOrder })));
});

/** Delete a provider photo (owner only). */
router.delete('/:id/photos/:photoId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const { id: providerId, photoId } = req.params;
  const providerRows = await db.select().from(providers).where(eq(providers.id, providerId)).limit(1);
  const provider = providerRows[0];
  if (!provider) {
    res.status(404).json({ error: 'Provider not found' });
    return;
  }
  if (provider.userId !== userId) {
    res.status(403).json({ error: 'Not allowed to delete photos from this provider' });
    return;
  }
  await db
    .delete(providerPhotos)
    .where(and(eq(providerPhotos.providerId, providerId), eq(providerPhotos.id, photoId)));
  res.status(204).send();
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const rows = await db.select().from(providers).where(eq(providers.id, id)).limit(1);
  const p = rows[0];
  if (!p) {
    return res.status(404).json({ error: 'Provider not found' });
  }
  res.json(toProviderJson(p));
});

export default router;

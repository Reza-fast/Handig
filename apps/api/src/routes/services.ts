import { Router } from 'express';
import { db } from '../db/index.js';
import { providers, services } from '../db/schema.js';
import { eq, asc } from 'drizzle-orm';

const router = Router();

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const s = db.select().from(services).where(eq(services.id, id)).get();
  if (!s) {
    return res.status(404).json({ error: 'Service not found' });
  }
  res.json({
    id: String(s.id),
    categoryId: String(s.categoryId),
    name: String(s.name),
    slug: String(s.slug),
    description: s.description == null ? null : String(s.description),
    sortOrder: Number(s.sortOrder),
    imageUrl: s.imageUrl == null ? null : String(s.imageUrl),
    createdAt: s.createdAt == null ? null : (s.createdAt instanceof Date ? s.createdAt.toISOString() : String(s.createdAt)),
  });
});

router.get('/:id/providers', (req, res) => {
  const { id } = req.params;
  const list = db
    .select()
    .from(providers)
    .where(eq(providers.serviceId, id))
    .all();
  const plain = list.map((p) => ({
    id: String(p.id),
    name: String(p.name),
    description: p.description == null ? null : String(p.description),
    categoryId: String(p.categoryId),
    serviceId: p.serviceId == null ? null : String(p.serviceId),
    address: p.address == null ? null : String(p.address),
    latitude: p.latitude == null ? null : Number(p.latitude),
    longitude: p.longitude == null ? null : Number(p.longitude),
    rating: p.rating == null ? null : Number(p.rating),
    imageUrl: p.imageUrl == null ? null : String(p.imageUrl),
    createdAt: p.createdAt == null ? null : (p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt)),
  }));
  res.json(plain);
});

export default router;

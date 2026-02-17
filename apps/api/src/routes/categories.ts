import { Router } from 'express';
import { db } from '../db/index.js';
import { categories, providers, services } from '../db/schema.js';
import { eq, asc } from 'drizzle-orm';

const router = Router();

router.get('/', async (_req, res) => {
  const list = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder));
  const plain = list.map((c) => ({
    id: String(c.id),
    name: String(c.name),
    slug: String(c.slug),
    description: c.description == null ? null : String(c.description),
    icon: c.icon == null ? null : String(c.icon),
    sortOrder: Number(c.sortOrder),
    createdAt: c.createdAt == null ? null : (c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt)),
  }));
  res.json(plain);
});

router.get('/:id/services', async (req, res) => {
  const { id } = req.params;
  const list = await db
    .select()
    .from(services)
    .where(eq(services.categoryId, id))
    .orderBy(asc(services.sortOrder));
  const plain = list.map((s) => ({
    id: String(s.id),
    categoryId: String(s.categoryId),
    name: String(s.name),
    slug: String(s.slug),
    description: s.description == null ? null : String(s.description),
    sortOrder: Number(s.sortOrder),
    imageUrl: s.imageUrl == null ? null : String(s.imageUrl),
    createdAt: s.createdAt == null ? null : (s.createdAt instanceof Date ? s.createdAt.toISOString() : String(s.createdAt)),
  }));
  res.json(plain);
});




router.get('/:id/providers', async (req, res) => {
  const { id } = req.params;
  const list = await db
    .select()
    .from(providers)
    .where(eq(providers.categoryId, id));
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

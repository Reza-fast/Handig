import { Router } from 'express';
import { db } from '../db/index.js';
import { providers } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const p = db.select().from(providers).where(eq(providers.id, id)).get();
  if (!p) {
    return res.status(404).json({ error: 'Provider not found' });
  }
  res.json({
    id: String(p.id),
    name: String(p.name),
    description: p.description == null ? null : String(p.description),
    categoryId: String(p.categoryId),
    address: p.address == null ? null : String(p.address),
    latitude: p.latitude == null ? null : Number(p.latitude),
    longitude: p.longitude == null ? null : Number(p.longitude),
    rating: p.rating == null ? null : Number(p.rating),
    imageUrl: p.imageUrl == null ? null : String(p.imageUrl),
    createdAt: p.createdAt == null ? null : (p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt)),
  });
});

export default router;

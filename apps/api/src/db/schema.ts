import { pgTable, text, integer, real, timestamp } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const services = pgTable('services', {
  id: text('id').primaryKey(),
  categoryId: text('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  slug: text('slug').notNull().unique(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const providers = pgTable('providers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: text('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  serviceId: text('service_id')
    .notNull()
    .references(() => services.id, { onDelete: 'cascade' }),
  address: text('address'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  rating: real('rating'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type Provider = typeof providers.$inferSelect;
export type NewProvider = typeof providers.$inferInsert;

import { db } from './index.js';
import { categories, providers, services } from './schema.js';
import { randomUUID } from 'crypto';

const homeId = randomUUID();
const wellnessId = randomUUID();
const lifestyleId = randomUUID();
const automotiveId = randomUUID();

const seedCategories = [
  { id: homeId, name: 'Home', slug: 'home', description: 'Plumbers, boiler service, repairs & more', icon: 'home', sortOrder: 0 },
  { id: wellnessId, name: 'Wellness', slug: 'wellness', description: 'Spa, sauna, massage & wellness', icon: 'spa', sortOrder: 1 },
  { id: lifestyleId, name: 'Lifestyle', slug: 'lifestyle', description: 'Haircut, beauty, personal care', icon: 'lifestyle', sortOrder: 2 },
  { id: automotiveId, name: 'Automotive', slug: 'automotive', description: 'Car repair, maintenance, and parts', icon: 'car', sortOrder: 3 },
];

// Services per category (ids for provider assignment)
const homePlumbersId = randomUUID();
const homeBoilerId = randomUUID();
const homeRepairsId = randomUUID();
const homeCleaningId = randomUUID();
const wellnessSpaId = randomUUID();
const wellnessSaunaId = randomUUID();
const wellnessMassageId = randomUUID();
const lifestyleBarbersId = randomUUID();
const lifestyleBeautyId = randomUUID();
const lifestylePhotoId = randomUUID();
const autoRepairId = randomUUID();
const autoMaintenanceId = randomUUID();

const seedServices = [
  { id: homePlumbersId, categoryId: homeId, name: 'Plumbers', slug: 'home-plumbers', sortOrder: 0, imageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop' },
  { id: homeBoilerId, categoryId: homeId, name: 'Boiler service', slug: 'home-boiler', sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop' },
  { id: homeRepairsId, categoryId: homeId, name: 'Repairs', slug: 'home-repairs', sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop' },
  { id: homeCleaningId, categoryId: homeId, name: 'Cleaning', slug: 'home-cleaning', sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop' },
  { id: wellnessSpaId, categoryId: wellnessId, name: 'Spa', slug: 'wellness-spa', sortOrder: 0, imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop' },
  { id: wellnessSaunaId, categoryId: wellnessId, name: 'Sauna', slug: 'wellness-sauna', sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop' },
  { id: wellnessMassageId, categoryId: wellnessId, name: 'Massage', slug: 'wellness-massage', sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop' },
  { id: lifestyleBarbersId, categoryId: lifestyleId, name: 'Barbers', slug: 'lifestyle-barbers', sortOrder: 0, imageUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=300&fit=crop' },
  { id: lifestyleBeautyId, categoryId: lifestyleId, name: 'Beauty', slug: 'lifestyle-beauty', sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop' },
  { id: lifestylePhotoId, categoryId: lifestyleId, name: 'Photography', slug: 'lifestyle-photography', sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=300&fit=crop' },
  { id: autoRepairId, categoryId: automotiveId, name: 'Repair', slug: 'auto-repair', sortOrder: 0, imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop' },
  { id: autoMaintenanceId, categoryId: automotiveId, name: 'Maintenance', slug: 'auto-maintenance', sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop' },
];

const seedProviders = [
  { id: randomUUID(), name: 'QuickFix Boiler Service', description: '24/7 boiler repair and installation.', categoryId: homeId, serviceId: homeBoilerId, address: '123 Main St', rating: 4.8 },
  { id: randomUUID(), name: "Joe's Plumbing", description: 'Residential and commercial plumbing.', categoryId: homeId, serviceId: homePlumbersId, address: '456 Oak Ave', rating: 4.6 },
  { id: randomUUID(), name: 'Serenity Spa', description: 'Massage, facials, and relaxation.', categoryId: wellnessId, serviceId: wellnessSpaId, address: '789 Wellness Blvd', rating: 4.9 },
  { id: randomUUID(), name: 'Nordic Sauna House', description: 'Traditional Finnish sauna experience.', categoryId: wellnessId, serviceId: wellnessSaunaId, address: '321 Pine Rd', rating: 4.7 },
  { id: randomUUID(), name: 'Style Studio', description: 'Haircuts, styling, and barber services.', categoryId: lifestyleId, serviceId: lifestyleBarbersId, address: '555 Style Lane', rating: 4.5 },
];

db.insert(categories).values(seedCategories).run();
db.insert(services).values(seedServices).run();
db.insert(providers).values(seedProviders).run();
console.log('Seed complete.');

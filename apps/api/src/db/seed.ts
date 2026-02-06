import { db } from './index.js';
import { categories, providers } from './schema.js';
import { randomUUID } from 'crypto';

const homeId = randomUUID();
const wellnessId = randomUUID();
const lifestyleId = randomUUID();

const seedCategories = [
  {
    id: homeId,
    name: 'Home',
    slug: 'home',
    description: 'Plumbers, boiler service, repairs & more',
    icon: 'home',
    sortOrder: 0,
  },
  {
    id: wellnessId,
    name: 'Wellness',
    slug: 'wellness',
    description: 'Spa, sauna, massage & wellness',
    icon: 'spa',
    sortOrder: 1,
  },
  {
    id: lifestyleId,
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Haircut, beauty, personal care',
    icon: 'lifestyle',
    sortOrder: 2,
  },
];

const seedProviders = [
  {
    id: randomUUID(),
    name: 'QuickFix Boiler Service',
    description: '24/7 boiler repair and installation.',
    categoryId: homeId,
    address: '123 Main St',
    rating: 4.8,
  },
  {
    id: randomUUID(),
    name: "Joe's Plumbing",
    description: 'Residential and commercial plumbing.',
    categoryId: homeId,
    address: '456 Oak Ave',
    rating: 4.6,
  },
  {
    id: randomUUID(),
    name: 'Serenity Spa',
    description: 'Massage, facials, and relaxation.',
    categoryId: wellnessId,
    address: '789 Wellness Blvd',
    rating: 4.9,
  },
  {
    id: randomUUID(),
    name: 'Nordic Sauna House',
    description: 'Traditional Finnish sauna experience.',
    categoryId: wellnessId,
    address: '321 Pine Rd',
    rating: 4.7,
  },
  {
    id: randomUUID(),
    name: 'Style Studio',
    description: 'Haircuts, styling, and barber services.',
    categoryId: lifestyleId,
    address: '555 Style Lane',
    rating: 4.5,
  },
];

db.insert(categories).values(seedCategories).run();
db.insert(providers).values(seedProviders).run();
console.log('Seed complete.');

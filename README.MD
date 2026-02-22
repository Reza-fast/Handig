# Handig

A cross-platform (iOS/Android) app to find local services: **Home** (boiler, plumber), **Wellness** (spa, sauna), **Lifestyle** (haircut, beauty).

- **Mobile**: React Native (Expo) with TypeScript
- **API**: Node.js + Express + **Drizzle ORM** (PostgreSQL / Supabase)

## Project structure

```
Handig/
├── apps/
│   ├── mobile/          # Expo React Native app
│   │   ├── app/         # Expo Router screens (file-based routing)
│   │   └── src/
│   │       ├── api/     # API client & React Query hooks
│   │       ├── theme/   # Theme context
│   │       └── types/   # Shared types
│   └── api/             # Backend API
│       └── src/
│           ├── db/      # Drizzle schema, migrations, seed
│           └── routes/  # Express routes
├── package.json         # Root workspaces
└── README.MD
```

## Prerequisites

- Node.js 20+
- npm (or pnpm/yarn)

## Setup

### 1. Install dependencies

From the repo root:

```bash
npm install
```

### 2. Database (API) — Supabase / PostgreSQL

1. Create a project at [supabase.com](https://supabase.com) and get your **Database** connection string (Project Settings → Database → Connection string, URI).
2. In `apps/api`, create a `.env` file and set:
   ```bash
   DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@...pooler.supabase.com:6543/postgres
   ```
   Use one line, no quotes. If your password contains `@`, `#`, `:`, `/`, or `%`, either percent-encode them (e.g. `@` → `%40`) or set a new database password in Supabase (letters and numbers only).
3. Migrations run automatically when the API starts. To run them manually (e.g. for seeding first):
   ```bash
   cd apps/api && npm run db:migrate
   ```
4. Seed categories and sample providers:
   ```bash
   npm run db:seed
   ```

Optional: inspect data with Drizzle Studio:

```bash
npm run db:studio
```

### 3. Run the API

```bash
npm run api
```

API runs at **http://localhost:3000**.

### 4. Run the mobile app

```bash
npm run mobile
```

Then press `i` for iOS simulator or `a` for Android emulator.

**Android emulator:** the app uses `http://localhost:3000` by default. To hit the API from the emulator, use your machine’s IP or Android’s special alias:

- Create `apps/mobile/.env` and set:
  - `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000` (Android emulator)
  - Or `EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000` for a physical device

### 5. Auth (Supabase)

The app uses **Supabase Auth** so users and providers can sign up, sign in, and manage profile and listings.

1. **API** — In `apps/api/.env` add **one** of:
   - **SUPABASE_URL** (recommended for projects using JWT Signing Keys / RS256 or ES256):
     ```bash
     SUPABASE_URL=https://<project-ref>.supabase.co
     ```
     The API will verify tokens using the project’s JWKS endpoint.
   - **SUPABASE_JWT_SECRET** (legacy, for HS256 only): from **Project Settings → API → JWT Secret**.

2. **Mobile** — In `apps/mobile/.env` add (from **Project Settings → API**):
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
   ```

3. In Supabase **Authentication → Providers**, enable **Email** (and optionally **Phone**).

4. **Provider photos** — To allow uploads from the app, create a Storage bucket (e.g. `provider-photos`) in Supabase and set policies so authenticated users can upload. For now, providers can add photos by pasting image URLs (e.g. from Supabase Storage or any public URL) in “Edit listing → Photos”.

## Scripts (from root)

| Script        | Description                |
|---------------|----------------------------|
| `npm run mobile` | Start Expo dev server      |
| `npm run api`    | Start API (tsx watch)      |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate`  | Run migrations             |
| `npm run db:studio`   | Open Drizzle Studio        |
| `npm run db:seed`     | Seed categories & providers (from `apps/api`) |

## API endpoints

**Public**

- `GET /api/categories` – list categories
- `GET /api/categories/:id/services` – services in a category
- `GET /api/categories/:id/providers` – providers in a category
- `GET /api/providers/:id` – single provider
- `GET /api/providers/:id/photos` – photos for a provider

**Authenticated** (send `Authorization: Bearer <supabase-access-token>`)

- `GET /api/me` – my profile (creates one if missing)
- `PATCH /api/me` – update profile (displayName, accountType, phone, companyName, avatarUrl)
- `GET /api/providers/my` – my provider listings
- `POST /api/providers` – create listing (name, categoryId, serviceId, description?, address?)
- `PATCH /api/providers/:id` – update my listing
- `POST /api/providers/:id/photos` – add photo (body: `{ "url": "..." }`)
- `DELETE /api/providers/:id/photos/:photoId` – remove photo

## Next steps

- Add search (by name, category)
- Add maps / “nearby” using provider lat/lng
- Add image picker + Supabase Storage upload for provider photos in the app

**Assets:** Replace the placeholder images in `apps/mobile/assets/` with your own `icon.png`, `splash-icon.png`, and `adaptive-icon.png` (e.g. 1024×1024 for icon) before publishing.

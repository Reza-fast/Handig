-- Add email and split address into street, street_number, zip_code, city
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "email" text;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "street" text;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "street_number" text;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "zip_code" text;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "city" text;
-- Drop old single address column (optional: run after backfilling from address if needed)
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "address";

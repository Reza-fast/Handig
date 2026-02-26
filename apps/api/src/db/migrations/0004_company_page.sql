-- Company page: description on profile + company_photos table
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "company_description" text;
CREATE TABLE IF NOT EXISTS "company_photos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "url" text NOT NULL,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

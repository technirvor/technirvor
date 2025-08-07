-- Remove foreign key constraint that references auth.users table
-- This constraint is causing permission errors when querying short_links

ALTER TABLE short_links DROP CONSTRAINT IF EXISTS short_links_created_by_fkey;

-- The created_by field will remain as a UUID field for tracking purposes
-- but without the foreign key constraint to auth.users
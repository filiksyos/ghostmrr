-- Migration: Remove DID-based authentication columns and enforce account_hash
-- This migration removes the did, public_key, and signature columns from the badges table
-- and makes account_hash NOT NULL, establishing it as the primary identifier.

-- Step 1: Drop DID-related constraints and indexes
ALTER TABLE badges DROP CONSTRAINT IF EXISTS badges_did_key;
DROP INDEX IF EXISTS idx_badges_did;

-- Step 2: Drop DID-based authentication columns
ALTER TABLE badges DROP COLUMN IF EXISTS did;
ALTER TABLE badges DROP COLUMN IF EXISTS public_key;
ALTER TABLE badges DROP COLUMN IF EXISTS signature;

-- Step 3: Make account_hash NOT NULL
ALTER TABLE badges ALTER COLUMN account_hash SET NOT NULL;

-- Step 4: Ensure account_hash has a unique constraint
-- Drop any existing constraint if present, then recreate with consistent naming
ALTER TABLE badges DROP CONSTRAINT IF EXISTS badges_account_hash_key;
ALTER TABLE badges ADD CONSTRAINT badges_account_hash_key UNIQUE (account_hash);

-- Step 5: Update column comment to reflect its role
COMMENT ON COLUMN badges.account_hash IS 'Stripe account identifier - primary business key for badge verification';

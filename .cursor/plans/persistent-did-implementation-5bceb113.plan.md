<!-- 5bceb113-073e-466a-8374-0f78f2b7e6cd f1c0f732-436d-46b1-aee9-53346c95ddd2 -->
# Supabase Leaderboard Migration Plan

## Overview

Replace localStorage-based leaderboard with Supabase database to enable a shared global leaderboard. Badges will be verified server-side before storage, and the leaderboard will fetch from the database.

## Architecture Changes

### 1. Supabase Project Setup

- Create new Supabase project via MCP
- Get project URL and anon key
- Store credentials in environment variables

### 2. Database Schema

**Table**: `badges`

```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  did TEXT UNIQUE NOT NULL,
  mrr NUMERIC NOT NULL,
  customers INTEGER NOT NULL,
  tier TEXT NOT NULL,
  public_key TEXT NOT NULL,
  signature TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_badges_did ON badges(did);
CREATE INDEX idx_badges_mrr ON badges(mrr DESC);
CREATE INDEX idx_badges_created_at ON badges(created_at DESC);
```

**Row Level Security (RLS)**:

- Enable RLS on `badges` table
- Allow anonymous SELECT (anyone can read leaderboard)
- Allow anonymous INSERT (anyone can submit verified badges)
- Allow anonymous UPDATE only for same DID (users can update their own badge)

### 3. Next.js API Routes

**File**: `app/api/badges/route.ts` (new)

- `GET`: Fetch all badges, sorted by MRR descending
- `POST`: Submit new badge (verify signature server-side before storing)

**File**: `app/api/badges/[did]/route.ts` (new)

- `GET`: Fetch single badge by DID
- `PUT`: Update badge by DID (verify signature and DID match)

### 4. Server-Side Verification Utility

**File**: `lib/crypto/verifier-server.ts` (new)

- Port `verifyBadge` function to Node.js environment
- Use Node.js Buffer instead of browser APIs
- Validate DID format matches public key

### 5. Frontend Updates

**File**: `app/verify/page.tsx`

- Remove localStorage logic
- After client-side verification succeeds, submit badge to `/api/badges` endpoint
- Handle API errors (duplicate DID, invalid signature, etc.)
- Show success/error messages from API response

**File**: `app/leaderboard/page.tsx`

- Remove localStorage logic
- Fetch badges from `/api/badges` endpoint on mount
- Add loading state
- Add error handling for API failures
- Optionally add refresh/polling mechanism

### 6. Environment Configuration

**File**: `.env.local` (new)

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key

**File**: `.env.example` (new)

- Template for environment variables

### 7. Dependencies

Add to `package.json`:

- `@supabase/supabase-js`: Supabase client library

## Implementation Details

### Badge Submission Flow

1. User pastes badge JSON in verify page
2. Client-side verification (instant feedback)
3. If valid, submit to `/api/badges` POST endpoint
4. Server re-verifies signature (security)
5. Server checks if DID exists:

   - If exists: Update existing badge (UPSERT)
   - If new: Insert new badge

6. Return success/error to client

### Leaderboard Fetch Flow

1. Leaderboard page loads
2. Fetch `/api/badges` GET endpoint
3. Server queries Supabase, sorted by MRR DESC
4. Return badges to client
5. Display sorted list

### Security Considerations

- Server-side verification prevents tampered badges from being stored
- DID uniqueness constraint prevents duplicate entries
- RLS policies ensure data integrity
- Anonymous access is safe because badges are cryptographically signed

## Files to Create/Modify

1. **Create**: `app/api/badges/route.ts`
2. **Create**: `app/api/badges/[did]/route.ts`
3. **Create**: `lib/crypto/verifier-server.ts`
4. **Modify**: `app/verify/page.tsx`
5. **Modify**: `app/leaderboard/page.tsx`
6. **Create**: `.env.local` (gitignored)
7. **Create**: `.env.example`
8. **Modify**: `package.json` (add @supabase/supabase-js)

## Migration Notes

- Existing localStorage badges will be lost (expected - moving to shared database)
- Users will need to re-submit their badges after migration
- No breaking changes to badge format or CLI

### To-dos

- [x] Create packages/cli/src/crypto/keypair.ts with loadOrCreateKeypair(), getKeypairPath(), and resetKeypair() functions
- [x] Modify packages/cli/src/crypto/signer.ts to use persistent keypair from keypair.ts instead of generating ephemeral keys
- [x] Create packages/cli/src/commands/did.ts with didShowCommand() and didResetCommand() functions
- [x] Add did show and did reset commands to packages/cli/src/bin/ghostmrr.ts
- [x] Update packages/cli/src/commands/verify.ts to display DID and note about persistence
- [ ] Create Supabase project via MCP and configure environment variables
- [ ] Create badges table with indexes and RLS policies via Supabase migration
- [ ] Install @supabase/supabase-js and create Supabase client utility
- [ ] Create server-side badge verifier (lib/crypto/verifier-server.ts)
- [ ] Create Next.js API routes for badges (GET all, POST submit, PUT update)
- [ ] Update verify page to submit badges to API instead of localStorage
- [ ] Update leaderboard page to fetch badges from API instead of localStorage
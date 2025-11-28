# 👻 GhostMRR

**Verify your startup revenue without exposing your Stripe data. Zero-trust, DID-powered.**

## What is GhostMRR?

GhostMRR is a web + CLI app that lets indie founders prove their MRR (Monthly Recurring Revenue) without sharing sensitive data:

- ✅ **Local-first**: Query Stripe API on your machine only
- ✅ **Cryptographically signed**: Ed25519 DID signatures
- ✅ **Privacy-preserving**: Only share MRR tier ($1k+, $10k+, etc) or exact numbers (your choice)
- ✅ **Account-based deduplication**: Prevents duplicate verifications from the same Stripe account
- ✅ **Instant**: `npx ghostmrr@latest verify` → get verified badge
- ✅ **Join groups**: Compete on leaderboards or join exclusive clubs like the $10+ MRR Club

---

## Quick Start

### CLI: Verify Your MRR

```bash
# Run CLI (no install needed)
npx ghostmrr@latest verify

# Follow prompts:
# 1. Click the pre-filled link to create a restricted API key (one-click setup)
# 2. Paste your restricted key (rk_live_... or rk_test_...)
# 3. CLI queries Stripe → calculates MRR
# 4. Generates signed verification.json
```

**Output: `verification.json`**
```json
{
  "did": "did:key:z6Mkf...",
  "metrics": {
    "mrr": 5000,
    "customers": 45,
    "tier": "$1k+"
  },
  "publicKey": "...",
  "signature": "...",
  "timestamp": "2025-11-25T12:34:56Z",
  "accountHash": "a1b2c3d4e5f6..."
}
```

### Web App: Verify & Join Groups

1. Go to [ghostmrr.com](https://ghostmrr.com)
2. Click "Verify Startup" and paste your `verification.json`
3. Get verified ✓ badge
4. Join groups like "Exact Numbers Leaderboard" or ">$10 MRR Club"
5. Compete on leaderboards and connect with other verified founders

---

## Architecture

```
ghosmrr/
├── packages/cli/        # NPM package for CLI
├── packages/shared/     # Shared TypeScript types
├── app/                 # Next.js 16 frontend
└── components/          # Verification badge UI
```

### How It Works

1. **CLI queries Stripe locally** (API key never leaves your machine)
2. **Calculates MRR** from active subscriptions
3. **Generates ephemeral Ed25519 keypair** (DID format)
4. **Signs metrics + timestamp + account hash** (cryptographically binds to your Stripe account)
5. **Web app verifies signature** client-side and stores badge in database
6. **Join groups** to compete on leaderboards or join exclusive clubs

### Security: Restricted API Keys Only

**GhostMRR only accepts restricted API keys** (`rk_live_...` or `rk_test_...`) for security. Restricted keys are read-only and safer:

- ✅ **Read-only**: Can only read subscription data, not modify anything
- ✅ **Minimal permissions**: Only needs `Subscriptions: Read` permission
- ✅ **One-click setup**: The CLI provides a pre-filled link that auto-configures everything

The CLI will show you a direct link to create a restricted key with the correct permissions. Just click, create, and paste!

**Why restricted keys?** Even if the key is exposed, it can only read data, not perform operations or access sensitive information.

---

## Tech Stack

### CLI
- Node.js + TypeScript
- `stripe` - Query Stripe API
- `@noble/ed25519` - Cryptographic signing
- `commander` - CLI framework
- `inquirer` - Interactive prompts

### Frontend
- Next.js 16 (App Router)
- React 19
- Tailwind CSS 3.4
- `@noble/ed25519` - Signature verification
- Supabase - Database and API routes

### Backend
- Supabase (PostgreSQL database)
- Next.js API routes for badge storage and retrieval
- Account-based deduplication to prevent duplicate verifications

---

## Development

```bash
# Install dependencies
pnpm install

# Run CLI locally
cd packages/cli
pnpm run dev

# Run frontend (single page app)
pnpm run dev
```

---

## Why GhostMRR?

**Problem**: Founders want to share revenue milestones, but:
- ❌ Sharing Stripe dashboard = security risk
- ❌ Self-reported numbers = not trustworthy
- ❌ Centralized verification = privacy concerns

**Solution**: GhostMRR
- ✅ Cryptographically verifiable (Ed25519 signatures)
- ✅ Privacy-preserving (choose to share tier or exact MRR)
- ✅ Account-based deduplication (one verification per Stripe account)
- ✅ Join verified groups and compete on leaderboards
- ✅ Open source = full transparency

---

## Inspired By

- [TrustMRR](https://github.com/sagarshende23/trustmrr) - UI/UX inspiration
- Decentralized Identifiers (DIDs)
- Zero-knowledge proofs philosophy

---

## License

MIT

---

## Contributing

PRs welcome!

---

**Built with 👻 by indie hackers, for indie hackers.**

# 👻 GhostMRR

**Verify your startup revenue without exposing your Stripe data. Zero-trust, DID-powered.**

## What is GhostMRR?

GhostMRR lets indie founders prove their MRR (Monthly Recurring Revenue) without sharing sensitive data:

- ✅ **Local-first**: Query Stripe API on your machine only
- ✅ **Cryptographically signed**: Ed25519 DID signatures
- ✅ **Privacy-preserving**: Only share MRR tier ($1k+, $10k+, etc)
- ✅ **No backend**: All verification happens client-side
- ✅ **Instant**: `npx ghostmrr verify` → get verified badge

---

## Quick Start

### CLI: Verify Your MRR

```bash
# Run CLI (no install needed)
npx @ghostmrr/cli verify

# Follow prompts:
# 1. Paste your Stripe secret key (local only)
# 2. CLI queries Stripe → calculates MRR
# 3. Generates signed verification.json
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
  "timestamp": "2025-11-25T12:34:56Z"
}
```

### Frontend: Display Your Badge

1. Go to [ghostmrr.app/verify](https://ghostmrr.app/verify)
2. Paste your `verification.json`
3. Get verified ✓ badge
4. Share on leaderboard

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
4. **Signs metrics + timestamp**
5. **Frontend verifies signature** using public key (no backend)

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
- Recharts (MRR visualization)
- `@noble/ed25519` - Signature verification

---

## Development

```bash
# Install dependencies
npm install

# Run CLI locally
cd packages/cli
npm run dev

# Run frontend
npm run dev
```

---

## Why GhostMRR?

**Problem**: Founders want to share revenue milestones, but:
- ❌ Sharing Stripe dashboard = security risk
- ❌ Self-reported numbers = not trustworthy
- ❌ Centralized verification = privacy concerns

**Solution**: GhostMRR
- ✅ Cryptographically verifiable
- ✅ Privacy-preserving (only tier, not exact MRR)
- ✅ No backend = no data exposure
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

PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)

---

**Built with 👻 by indie hackers, for indie hackers.**

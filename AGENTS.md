# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

GhostMRR is a privacy-preserving startup revenue verification platform (Next.js 16 web app + CLI tool) using a pnpm monorepo layout. See `README.md` for full details.

### Key services

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Next.js web app | `pnpm dev` (from repo root) | 3000 | Requires `.env.local` with Supabase vars |
| CLI tool | `npx tsx src/bin/ghostmrr.ts` (from `packages/cli/`) | N/A | `did show` is a quick non-interactive smoke test |

### Non-obvious caveats

- **`next lint` does not exist in Next.js 16.** The `pnpm lint` script will fail. Use `npx tsc --noEmit` for type checking instead.
- **pnpm workspaces warning:** The repo uses the npm-style `"workspaces"` field in `package.json` instead of a `pnpm-workspace.yaml`. pnpm will emit a warning but root-level `pnpm install` still works. The CLI package (`packages/cli/`) has its own `pnpm-lock.yaml` and must be installed separately: `cd packages/cli && pnpm install`.
- **Build script approvals:** `sharp` (root) and `esbuild` (CLI) need their build scripts allowed. This is handled via `pnpm.onlyBuiltDependencies` in the respective `package.json` files.
- **Supabase env vars:** The app requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`. Without them, the Supabase client import throws at module load time. For dev without a real Supabase project, use placeholder values — the app renders but API calls to `/api/badges` will fail.
- **CLI `verify` command** requires a Stripe restricted API key and is interactive (uses `inquirer` prompts). Use `did show` for non-interactive testing.

# gartenscan

Plant & garden problem identification app. Next.js 16 + React 19 + TypeScript + Supabase.

## Environment

Copy `.env.example` to `.env.local` and fill in:

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL (EU Frankfurt) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Never expose to client. Used for storage writes + RPC. |
| `SUPABASE_ACCESS_TOKEN` | CLI only | Personal access token for `supabase` CLI (db push, gen types) |
| `PLANTNET_API_KEY` | server | Pl@ntNet. Leave empty → `/scan/new` shows `provider_error`. |
| `PLANTNET_PROJECT` | server | Default `weurope` (West-European flora) |
| `ANTHROPIC_API_KEY` | server | Claude Vision for image pre-triage |

## First-time setup

```bash
# 1. Install deps
npm install

# 2. Copy env
cp .env.example .env.local
# Fill in values from Supabase dashboard, Pl@ntNet, Anthropic

# 3. Link and push DB migrations
npx supabase link --project-ref <your-ref>
npx supabase db push

# 4. Enable anonymous sign-ins (once)
# In Supabase dashboard: Authentication → Providers → Email → "Enable anonymous sign-ins" ON
# Or via Management API:
# curl -X PATCH "https://api.supabase.com/v1/projects/<ref>/config/auth" \
#      -H "Authorization: Bearer <access-token>" \
#      -H "Content-Type: application/json" \
#      -d '{"external_anonymous_users_enabled": true}'

# 5. Run
npm run dev
```

## Tests

```bash
npm test          # run all tests once (22 tests at time of writing)
npm run test:watch
```

## Architecture

- **UI** (Client/Server Components) → **Server Actions / Route Handlers** → **Services** → **Providers** → external APIs.
- **Providers:** `PlantNetProvider` (plant ID), `ClaudeVisionTriageProvider` (pre-triage), `MockIdentificationProvider` (tests only).
- **Services:** `analyzeImageService`, `scanRepository`, `historyService`, `usageCounterService`, `imageStorageService`, `profileRepository`.
- **Persistence:** Supabase (Postgres + Storage + Auth). Anonymous sign-ins auto-triggered by `src/proxy.ts` (Next.js 16 proxy file — formerly `middleware.ts`).

## Pipeline Integration

See `CLAUDE.md`.

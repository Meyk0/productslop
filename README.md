# Product Slop

The front page of AI slop: a lightweight launch board for weekend projects.

## Current slice

- Next.js App Router with TypeScript and Tailwind
- Homepage, real search, detail page, submit flow, Hall of Slop, FAQ, About, and magic-link manage flow
- Locked reaction/type vocabulary in domain code
- File-backed local slop/reaction store for development before Supabase keys exist
- OpenAI metadata adapter with safe fallback when `OPENAI_API_KEY` is missing
- One-time Reslop tagline reroll and share CTAs on the submission reveal
- Cron-backed Slop of the Day calculation with Hall of Slop storage
- Abuse checks for masked domains, disposable email, risky generated copy, Turnstile, rate limits, and optional Safe Browsing
- OG card route at `/api/og/[slug]`
- Unit tests for validation, ranking, reactions, local persistence, sharing, slugging, and AI response parsing
- Supabase SQL schema starter in `supabase/schema.sql` and launch seed data in `supabase/seed.sql`

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Quality

GitHub Actions runs these gates on pull requests and pushes to `main`.

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

## Environment

Copy `.env.example` to `.env.local` and fill in service keys as they become available.
The app builds without keys by using local fallbacks, but production submissions need:

- Supabase URL and service-role key
- OpenAI key for structured metadata generation (`OPENAI_MODEL` defaults to `gpt-5.4-mini`)
- Microlink free endpoint for OG metadata and screenshots (`MICROLINK_API_KEY` is optional unless we upgrade to Pro)
- Cloudflare Turnstile keys
- Resend key and verified sender
- Google Safe Browsing key

## Production Data

The Supabase project starts empty after `supabase/schema.sql` is applied. Run `supabase/seed.sql`
once to create founding slops, reaction totals, and an initial Slop of the Day winner. The seed is
idempotent, so rerunning it updates the same launch rows and does not duplicate reactions.

## Near-term build order

1. Add URL resolution checks and expand the maintained blocklists from real launch telemetry.
2. Add production Vercel/Supabase setup docs and deployment checklist.
3. Add Slop of the Day homepage polish and winner backfill tooling.
4. Add fuller mobile/browser verification for the QR submission flow.
5. Add a production smoke-test checklist for submit, react, manage, and delete flows.

# Product Slop

The front page of AI slop: a Product Hunt parody for AI weekend projects.

## Current slice

- Next.js App Router with TypeScript and Tailwind
- Product Hunt-inspired homepage, detail page, submit flow, Hall of Slop, About, Legal, and magic-link manage flow
- Locked reaction/type vocabulary in domain code
- File-backed local slop/reaction store for development before Supabase keys exist
- Claude metadata adapter with safe fallback when `ANTHROPIC_API_KEY` is missing
- One-time Reslop tagline reroll and share CTAs on the submission reveal
- Cron-backed Slop of the Day calculation with Hall of Slop storage
- Abuse checks for masked domains, disposable email, risky generated copy, Turnstile, rate limits, and optional Safe Browsing
- OG card route at `/api/og/[slug]`
- Unit tests for validation, ranking, reactions, local persistence, sharing, slugging, and AI response parsing
- Supabase SQL schema starter in `supabase/schema.sql`

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
- Anthropic key for Claude Haiku metadata generation
- Microlink key for OG metadata and screenshots
- Cloudflare Turnstile keys
- Resend key and verified sender
- Google Safe Browsing key

## Near-term build order

1. Add URL resolution checks and expand the maintained blocklists from real launch telemetry.
2. Add production Vercel/Supabase setup docs and deployment checklist.
3. Add Slop of the Day homepage polish and winner backfill tooling.
4. Add fuller mobile/browser verification for the QR submission flow.
5. Seed 10-20 founding slops for launch readiness.

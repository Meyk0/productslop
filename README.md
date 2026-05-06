# Product Slop

The front page of AI slop: a Product Hunt parody for AI weekend projects.

## Current slice

- Next.js App Router with TypeScript and Tailwind
- Product Hunt-inspired homepage, detail page, submit flow, Hall of Slop, About, Legal, and manage-link shell
- Locked reaction/type vocabulary in domain code
- In-memory local slop/reaction store for development before Supabase keys exist
- Claude metadata adapter with safe fallback when `ANTHROPIC_API_KEY` is missing
- OG card route at `/api/og/[slug]`
- Unit tests for validation, ranking, reactions, slugging, and AI response parsing
- Supabase SQL schema starter in `supabase/schema.sql`

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Quality

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

1. Replace the in-memory store with Supabase reads/writes and RLS-safe server paths.
2. Add Microlink metadata/screenshot ingestion to the submission service.
3. Add Turnstile and rate-limit enforcement to submission and reaction routes.
4. Send magic-link email with Resend and implement edit/delete.
5. Add Slop of the Day cron and persistent Hall of Slop winners.

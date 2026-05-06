# Product Slop

The front page of AI slop: a Product Hunt parody for AI weekend projects.

## Current slice

- Next.js App Router with TypeScript and Tailwind
- Product Hunt-inspired homepage, detail page, submit flow, Hall of Slop, About, Legal, and magic-link manage flow
- Locked reaction/type vocabulary in domain code
- File-backed local slop/reaction store for development before Supabase keys exist
- Claude metadata adapter with safe fallback when `ANTHROPIC_API_KEY` is missing
- One-time Reslop tagline reroll and share CTAs on the submission reveal
- OG card route at `/api/og/[slug]`
- Unit tests for validation, ranking, reactions, local persistence, sharing, slugging, and AI response parsing
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

1. Add the Turnstile client widget to the submit and first-reaction flows.
2. Add Google Safe Browsing and profanity/disposable-email checks.
3. Add Slop of the Day cron and persistent Hall of Slop winners.
4. Add fuller mobile/browser verification for the QR submission flow.
5. Seed 10-20 founding slops for launch readiness.

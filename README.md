# Aphuranta OS

Mobile-first apparel operations software for Aphuranta Apparels. The current foundation includes the executive dashboard, production tracking, global search, quick-create workflows, responsive navigation, Google authentication, and secure access-code login.

## Local setup

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env.local` and configure the values.
3. Start the app with `pnpm dev`.

## Required environment variables

- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `ACCESS_PASSWORD`

Secrets must be configured in Vercel and must never be committed to GitHub.

## Deployment

The production project is connected to GitHub through Vercel. Changes pushed to `main` create a production deployment automatically; other branches receive preview deployments.

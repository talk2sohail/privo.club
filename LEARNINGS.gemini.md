# LEARNINGS.gemini.md - Invito Learning Log

## 2026-01-11
### Summary of Work So Far
- Explored the project structure and identified core features: Circle management, Invitation system, RSVP tracking, and Event feeds.
- Analyzed the Prisma schema which includes models for `User`, `Circle`, `CircleMember`, `Invite`, `RSVP`, `EventFeedItem`, and `MediaItem`.
- Confirmed the use of Next.js App Router and Server Actions.
- Initialized core documentation: `GEMINI.md`, `task.md`, and this learning log.
- Noted that the project was recently moved and troubleshooting for running it was performed in a previous session.

## 2026-01-13
### Google Sign-In Integration
- Integrated Google Sign-In using NextAuth v5.
- Discovered that NextAuth v5 defaults to `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` for environment variables.
- Updated the custom sign-in page (`src/app/auth/signin/page.tsx`) with a Google brand-consistent SVG and button.
- Resolved `invalid_client` error by aligning environment variable naming in the deployment environment (Coolify).

## 2026-01-14
### Progressive Web App (PWA) Implementation
- Converted the app to a PWA using `@serwist/next` and `@serwist/sw`.
- **Constraint**: `@serwist/next` currently blocks Turbopack (`next dev --turbopack`). Updated `package.json` build script to `next build --webpack` to ensure successful builds.
- Added a `manifest.ts` file for dynamic web manifest generation.
- Added a `sw.ts` file for Service Worker configuration (precaching + runtime caching).
- Updated `ts.config.json` to include `webworker` lib and Serwist types.
- **Fix**: Resolved `[auth][error] UntrustedHost` by adding `AUTH_TRUST_HOST=true` to `.env` when running `npm start` locally.

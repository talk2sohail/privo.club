# GEMINI.md - Invito Project Context

## Project Purpose
Invito is a modern event management and invitation platform. It allows users to create social "Circles", send invitations ("Invites"), manage RSVPs, and share updates and media within an event feed.

## Architecture Overview
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS / Vanilla CSS (Modern Aesthetics)

## Key Files and Directories
- `src/app`: Application routes and pages.
- `src/app/actions`: Server actions for business logic (Circles, Invites, Feed).
- `src/components`: UI components.
- `prisma/schema.prisma`: Data model definition.
- `src/auth.ts`: NextAuth configuration.

## Project-Specific Conventions
- Uses Server Actions for data mutations.
- Prisma for database interactions.
- Modern UI with a focus on visual excellence.

## Local Setup
1. Install dependencies: `npm install`
2. Set up environment variables in `.env`.
3. Run database migrations: `npx prisma migrate dev`
4. Start development server: `npm run dev`

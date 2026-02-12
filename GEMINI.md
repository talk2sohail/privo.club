# GEMINI.md - Privo.club Project Context

## Project Purpose
Privo.club is a modern event management and invitation platform. It allows users to create social "Circles", send invitations ("Invites"), manage RSVPs, and share updates and media within an event feed.

## Architecture Overview
- **Frontend**: Next.js 16 (App Router) with TypeScript.
- **Backend**: Go 1.25+ with Chi Router and `sqlx`.
- **Database**: PostgreSQL (Manual Migrations, No Prisma).
- **Authentication**: NextAuth.js v5 (Frontend) synced with Go Backend via shared secret JWT validation.
- **Styling**: Tailwind CSS v4 / Vanilla CSS (Modern Aesthetics).
- **PWA**: Powered by `@serwist/next`.

## Key Files and Directories
- `src/app`: Application routes and pages.
- `src/app/actions`: Server Actions (act as API clients to the Go Backend).
- `src/lib/api.ts`: HTTP client for Go Backend communication.
- `backend/`: complete Go backend source code.
- `backend/internal/db`: Database connection and logic (`sqlx`).
- `backend/migrations`: Manual SQL migration files.
- `src/auth.ts`: NextAuth configuration and backend synchronization logic.

## Project-Specific Conventions
- **Hybrid Architecture**: Frontend acts as a UI layer and proxy; heavy business logic and data persistence reside in the Go backend.
- **Manual Migrations**: Database changes are managed via SQL files in `backend/migrations`.
- **Modern UI**: Strict adherence to premium, modern visual aesthetics.

## Local Setup
1. **Frontend**: `npm install` -> `npm run dev` (Port 3000)
2. **Backend**: `cd backend` -> `go mod download` -> `make migrate` -> `make run` (Port 8080)
3. **Environment**: Ensure `.env` includes `AUTH_SECRET` shared between front and back, and `BACKEND_URL` points to the Go service.

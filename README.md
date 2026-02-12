<div align="center">
  <img src="public/icons/icon-192.png" alt="Privo.club Logo" width="120" height="120" />
  
  # Privo.club
  
  ### Celebrate Moments That Matter
  
  <p align="center">
    A modern social event platform for creating intimate gatherings with the people who matter most
  </p>

  <p align="center">
    <a href="https://privo.club">Website</a>
    ·
    <a href="https://github.com/talk2sohail/invito/issues">Report Bug</a>
    ·
    <a href="https://github.com/talk2sohail/invito/issues">Request Feature</a>
  </p>

![Deployment](https://img.shields.io/badge/deployment-coolify-6366f1?style=flat-square&logo=docker)
![Status](https://img.shields.io/website?url=https%3A%2F%2Fprivo.club&style=flat-square&label=status)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Version](https://img.shields.io/github/package-json/v/talk2sohail/invito?style=flat-square)
![Go Version](https://img.shields.io/github/go-mod/go-version/talk2sohail/invito?filename=backend%2Fgo.mod&style=flat-square)

</div>

---

## 🌟 Overview

Privo.club is a privacy-focused social event platform that helps you organize and celebrate life's special moments with your close ones. No noise, no strangers—just your people.

## ✨ Features

- **🔒 Private Circles**: Create invite-only social groups (hives) for different occasions.
- **📨 Beautiful Invitations**: Send customizable event invitations with RSVP tracking.
- **📱 Progressive Web App (PWA)**: Installable on any device with offline capabilities via `@serwist/next`.
- **💬 Event Feed**: Share updates, photos, and memories within specific event contexts.
- **👥 Member Management**: Granular control over circle members with approval workflows.
- **🎨 Modern UI/UX**: Premium aesthetic using Tailwind CSS v4, shadcn/ui, and framer-motion animations.
- **👤 User Profiles**: customizable profiles with privacy controls (Public, Private, Circles Only).

## 🚀 Tech Stack

### Frontend (User Interface)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: Server Actions + React Hooks
- **Authentication**: [NextAuth.js v5](https://authjs.dev/) (Google, GitHub OAuth)
- **PWA**: `@serwist/next` for service worker management
- **Icons**: Lucide React

### Backend (API & Business Logic)
- **Language**: [Go 1.25+](https://go.dev/)
- **Router**: [Chi Router](https://github.com/go-chi/chi) v5
- **Database Access**: `sqlx` for type-safe SQL execution
- **Database**: PostgreSQL 14+
- **Migrations**: Manual SQL migrations (managed via `make migrate`)
- **Authentication**: JWT validation synced with frontend session via usage of shared secrets

## 📋 Prerequisites

- Node.js 18+ and npm
- Go 1.25+
- PostgreSQL 14+
- GitHub and/or Google OAuth credentials

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/talk2sohail/invito.git
cd invito
```

### 2. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/privo

# Auth Configuration (Shared between Frontend & Backend)
AUTH_SECRET=your-random-secret-here
AUTH_TRUST_HOST=true
NEXTAUTH_URL=http://localhost:3000

# Backend Connection
BACKEND_URL=http://localhost:8080/api

# OAuth Providers
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret
```

### 3. Install dependencies and run migrations

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
go mod download
make migrate
```

### 4. Start the development servers

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
make run
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🧪 Running Tests & Tools

**Frontend:**
```bash
npm run lint         # Run linter
npm run type-check   # Run TypeScript check
```

**Backend:**
```bash
cd backend
make test            # Run unit tests
make coverage        # Generate and view coverage report
make migrate-status  # Check migration status
make build           # Build production binary
```

## 📦 Architecture Highlights

- **Hybrid Architecture**: Next.js serves as the frontend UI layer and proxy, while the heavy business logic and data persistence reside in the high-performance Go backend.
- **Manual Migrations**: Database schema changes are strictly managed via raw SQL files in `backend/migrations` for maximum control.
- **Unified Auth**: The frontend handles OAuth flows via NextAuth v5, extracting a session token which is validated by the Go backend for protected resources.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

<div align="center">
  <p>Made with ❤️ for celebrating moments that matter</p>
  <p>
    <a href="https://privo.club">privo.club</a>
  </p>
</div>

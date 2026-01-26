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

- **🔒 Private Circles**: Create invite-only social groups (hives) for different occasions
- **📨 Beautiful Invitations**: Send customizable event invitations with RSVP tracking
- **📱 Progressive Web App**: Install on any device with offline support
- **💬 Event Feed**: Share updates, photos, and memories after events
- **👥 Member Management**: Approve/reject member requests and manage permissions
- **🎨 Modern UI**: Beautiful, responsive design with Tailwind CSS v4 and shadcn/ui

## 🚀 Tech Stack

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Authentication**: NextAuth.js v5 (Google, GitHub OAuth)
- **PWA**: Serwist for service workers

### Backend

- **Language**: Go 1.25+
- **Router**: Chi
- **Database**: PostgreSQL with manual migrations
- **Auth**: JWT validation synchronized with NextAuth

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
DATABASE_URL=postgresql://user:password@localhost:5432/privo
AUTH_SECRET=your-random-secret-here
AUTH_TRUST_HOST=true
BACKEND_URL=http://localhost:8080/api
NEXTAUTH_URL=http://localhost:3000

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

## 🧪 Running Tests

**Frontend:**

```bash
npm run lint
npm run type-check
```

**Backend:**

```bash
cd backend
make test
make coverage  # Opens HTML coverage report
```

## 📦 Building for Production

**Frontend:**

```bash
npm run build
npm start
```

**Backend:**

```bash
cd backend
make build
./bin/api
```

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

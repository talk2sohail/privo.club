# Coolify Deployment Guide

This guide details how to deploy the **Privo.club** application to your Coolify instance using **Nixpacks**.

## 1. Prerequisites
- A running Coolify instance.
- Access to your Coolify dashboard.

> [!NOTE]
> **PostgreSQL Extensions**: Based on your current schema, **NO** special PostgreSQL extensions are required. The standard PostgreSQL image in Coolify will work perfectly.
>
> **SSL Configuration**: If your App and Database are both in Coolify, you generally **do not** need SSL parameters. If connecting externally, append `?sslmode=require` to your connection string.

## 2. Database Setup
1.  Navigate to your Project in Coolify.
2.  Click **+ New** -> **Database** -> **PostgreSQL**.
3.  Configure the database (name, version, etc.) or leave defaults.
4.  Start the database.
5.  Once running, go to the database **Settings** or **Connection Details**.
6.  Copy the `Postgres URL` (Internal). It usually looks like:
    `postgresql://postgres:password@uuid:5432/postgres`

### 3. Application Setup
1.  Go back to your Project.
2.  Click **+ New** -> **Application** -> **Public Repository** (or GitHub App if connected).
3.  Enter your repository URL: `https://github.com/your-username/invito` (or select from list).
4.  **Build Pack**: Select `Nixpacks`.
5.  **Ports Exposes**: Enter `3000`.

## 4. Environment Variables
Navigate to the **Environment Variables** tab of your new Application and add the following keys. **You must click "Save" after adding them.**

| Key | Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...` | Paste the Internal URL from Step 2. |
| `AUTH_SECRET` | `...` | Generate a random string (e.g., `openssl rand -base64 32`). |
| `AUTH_TRUST_HOST` | `true` | Required for NextAuth behind Coolify's proxy. |
| `NEXTAUTH_URL` | `https://your-domain.com` | The full public URL of your app. |

## 5. Configuration & Deploy
1.  Go to the **Configuration** -> **General** tab.
2.  **Build Command**: Leave as `npm run build` or empty (Nixpacks detects it).
3.  **Start Command**: Paste the following EXACTLY:
    ```bash
    npx prisma migrate deploy && npm start
    ```
    > [!IMPORTANT]
    > This command ensures your database schema is updated every time you deploy.
4.  **Deploy**: Click the **Deploy** button in the top right.

## 6. Verification
- **Build Logs**: Watch the logs. You should see `prisma generate` running after dependencies install.
- **Runtime**: Once deployed, open the URL.
    - Sign Up/Login to verify database connection.
    - Create a Circle/Event to verify data persistence.

## 7. Post-Deployment: OAuth
After deploying, your app will be running on a new domain (e.g., `https://privo.club`). You **MUST** update your GitHub OAuth App:

1.  Go to **GitHub Settings** -> **Developer Settings** -> **OAuth Apps**.
2.  Select your Privo.club app.
3.  Update **Homepage URL** to your new domain.
4.  Update **Authorization callback URL** to:
    `https://your-new-domain.com/api/auth/callback/github`
5.  Save changes.

# Privo.club Deployment Guide

This guide details how to deploy the **Go Backend** as a systemd service on an Ubuntu VPS and configure the **Next.js Frontend** to connect to it.

## 1. Prepare Backend for Deployment

### A. Update Makefile
We need to add a cross-compilation target for Linux.
Update `backend/Makefile` to include:

```makefile
build-linux: ## Build for Linux amd64
	@echo "Building for Linux (amd64)..."
	@GOOS=linux GOARCH=amd64 go build -o $(BUILD_DIR)/$(BINARY_NAME)-linux-amd64 $(CMD_PATH)
	@echo "Build complete: $(BUILD_DIR)/$(BINARY_NAME)-linux-amd64"
```

### B. Create a Service File
Create a file named `privo-club-backend.service` in your project (e.g., in `backend/deploy/`):

```ini
[Unit]
Description=Privo.club Go Backend API
After=network.target

[Service]
# Replace 'ubuntu' with your VPS username
User=ubuntu
Group=ubuntu

# Set working directory to where you will upload the binary
WorkingDirectory=/home/ubuntu/privo-club-backend

# Command to run the binary
ExecStart=/home/ubuntu/privo-club-backend/api

# Restart automatically if it crashes
Restart=always
RestartSec=5

# Environment Variables (Or load from .env file with EnvironmentFile=...)
Environment="PORT=8080"
Environment="DATABASE_URL=postgresql://user:password@localhost:5432/privo_club"
Environment="NEXTAUTH_SECRET=your-secret-key-here"

[Install]
WantedBy=multi-user.target
```

## 2. Deploy to VPS

### Step 1: Build locally
Run the following command in your `backend` directory:
```bash
make build-linux
```

### Step 2: Upload to VPS
Use `scp` to copy the binary to your server:
```bash
# Create directory on server
ssh ubuntu@your-vps-ip "mkdir -p ~/invito-backend"

# Copy binary
scp backend/bin/api-linux-amd64 ubuntu@your-vps-ip:~/invito-backend/api
```

### Step 3: Install Service
SSH into your server and set up systemd:
```bash
# 1. Create a service file
sudo nano /etc/systemd/system/invito-backend.service
# (Paste the content from the template in section 1B, adjusting variables)

# 2. Reload systemd
sudo systemctl daemon-reload

# 3. Enable and Start
sudo systemctl enable invito-backend
sudo systemctl start invito-backend

# 4. Check Status
sudo systemctl status invito-backend
```

## 3. Firewall & Networking (Important)

### Scenario A: Next.js is ALSO on this VPS
If you are running your Next.js app on this same server (e.g., using `pm2` or Docker):
1.  **Do NOT** open port 8080 to the public.
2.  Set `BACKEND_URL=http://localhost:8080` in your Next.js environment.
3.  Next.js will talk to the Go backend via `localhost` (loopback interface), which is fast and secure.

### Scenario B: Next.js is on Vercel / Netlify
If you are hosting your frontend on Vercel:
1.  **YOU MUST** open port 8080 (or your configured port) to the internet so Vercel can reach it.
    ```bash
    sudo ufw allow 8080
    ```
2.  Set `BACKEND_URL=http://your-vps-ip:8080` in Vercel.
3.  **Security Warning**: Since port 8080 is open, ensure your application handles authentication correctly (which `invito` does via JWTs). Ideally, set up Nginx with SSL (HTTPS) as a reverse proxy instead of exposing the raw Go binary.

## 4. Configure Frontend

Your Next.js app needs to know where the backend is.

1.  In your **local development**, you use:
    ```env
    BACKEND_URL=http://localhost:8080
    ```

2.  In **production (Vercel, Netlify, or VPS)**, set the environment variable:
    ```env
    BACKEND_URL=http://your-vps-ip:8080
    # OR if using Nginx with domain
    BACKEND_URL=https://api.yourdomain.com
    ```
    *Note: Since you are using Server Components, the Next.js server (wherever it is deployed) looks for this variable.*

## 4. Verification
1.  Watch backend logs: `journalctl -u invito-backend -f`
2.  Hit the API: `curl http://your-vps-ip:8080/health` (if you have one) or `/circles`.

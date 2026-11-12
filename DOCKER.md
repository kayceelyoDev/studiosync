# StudioSync - Production Docker Architecture (24/7 Ubuntu Deployment)

This document provides a complete guide for deploying and running **StudioSync** 24/7 on an **Ubuntu Linux server** using Docker and Docker Compose.

---

## 1. System Architecture

The containerized stack is composed of 5 production-tuned services:

| Service | Container Name | Description | Restart Policy |
| :--- | :--- | :--- | :--- |
| **app** | `studiosync_app` | Nginx + PHP 8.4-FPM managed by Supervisor. Serves the web interface, API, Inertia React frontend, and static assets. | `unless-stopped` |
| **queue** | `studiosync_queue` | Laravel background queue worker (`php artisan queue:work`) processing asynchronous jobs (Vercel deployments, emails, heavy tasks). | `unless-stopped` |
| **scheduler** | `studiosync_scheduler` | Background cron scheduler (`php artisan schedule:work`) running scheduled tasks every minute. | `unless-stopped` |
| **postgres** | `studiosync_db` | PostgreSQL 16 database with persistent storage volume (`postgres_data`). | `unless-stopped` |
| **redis** | `studiosync_redis` | Redis 7 in-memory store for cache, session storage, and queue broker with append-only persistence (`redis_data`). | `unless-stopped` |

### Key Production Features:
- **Zero-Downtime Resilience**: All containers have `restart: unless-stopped`. If the Ubuntu server reboots or any process fails, Docker will automatically restart the containers.
- **OPcache & High Performance**: PHP 8.4 OPcache is enabled and optimized for production.
- **Static Asset Caching**: Nginx serves compiled Vite assets (`public/build`), images, and fonts with gzip compression and 1-year immutable caching.
- **Log Rotation**: Built-in Docker `json-file` log rotation (max 10MB per file, limited files) to prevent your server disk from filling up.
- **Automatic Migration & Link Check**: The container entrypoint automatically validates database health, creates `public/storage` symlinks, runs migrations, and warms route/config caches.

---

## 2. Quick Start on Ubuntu Server

### Step 1: Install Docker & Docker Compose (if not already installed)

On your Ubuntu server, run:
```bash
sudo apt-get update
sudo apt-get install -y curl ca-certificates git

# Install official Docker
curl -fsSL https://get.docker.com | sh

# Allow non-root user to manage Docker
sudo usermod -aG docker $USER
newgrp docker
```

Verify installation:
```bash
docker --version
docker compose version
```

---

### Step 2: Clone the Project Repository

```bash
git clone <your-git-repository-url> /var/www/studiosync
cd /var/www/studiosync
```

---

### Step 3: Configure Environment Variables

Copy `.env.docker.example` to `.env`:
```bash
cp .env.docker.example .env
```

Open `.env` in nano:
```bash
nano .env
```

Make sure the following variables are customized:
1. `APP_URL`: Set to your server IP or domain (e.g. `http://your-server-ip` or `https://studiosync.example.com`).
2. `APP_PORT`: Port exposed on host (default `80`, or `8080` if using a reverse proxy).
3. `DB_PASSWORD`: Set a strong, secure password for PostgreSQL.
4. `AUTORUN_SEEDER`: Set to `true` on the very **first run** if you want to run `RoleSeeder` and `UserSeeder`. Change back to `false` afterwards.
5. `VERCEL_API_TOKEN` & third-party credentials: Add any API keys if required.

Save and exit (`Ctrl + O`, `Enter`, then `Ctrl + X`).

---

### Step 4: Build & Launch Stack

Make the deployment script executable and run it:
```bash
chmod +x deploy.sh
./deploy.sh
```

Or run Docker Compose directly:
```bash
docker compose up -d --build
```

---

### Step 5: Verify Running Services

Check the health status of all containers:
```bash
docker compose ps
```

You should see all 5 containers in the `Up (healthy)` state:
```
NAME                    IMAGE                   STATUS                  PORTS
studiosync_app          studiosync-app:latest   Up (healthy)            0.0.0.0:80->80/tcp
studiosync_queue        studiosync-app:latest   Up (healthy)            
studiosync_scheduler    studiosync-app:latest   Up (healthy)            
studiosync_db           postgres:16-alpine      Up (healthy)            127.0.0.1:5432->5432/tcp
studiosync_redis        redis:7-alpine          Up (healthy)            127.0.0.1:6379->6379/tcp
```

---

## 3. Useful Day-to-Day Management Commands

### Viewing Logs
```bash
# View all logs in real-time:
docker compose logs -f

# View logs for a specific service:
docker compose logs -f app
docker compose logs -f queue
docker compose logs -f postgres
```

### Running Laravel Artisan Commands
```bash
# Run any artisan command inside the app container:
docker compose exec app php artisan route:list
docker compose exec app php artisan migrate:status
docker compose exec app php artisan queue:failed

# Open interactive Laravel Tinker:
docker compose exec app php artisan tinker
```

### Restarting & Stopping
```bash
# Restart the stack:
docker compose restart

# Restart a specific service (e.g. after updating code):
docker compose restart queue
docker compose restart app

# Stop the stack:
docker compose down
```

### Applying Code Updates in Production
When you push code changes to GitHub, pull and rebuild on your server:
```bash
git pull origin main
docker compose up -d --build --remove-orphans
```

---

## 4. Database Maintenance & Backups

### Creating a Database Backup (pg_dump)
To back up the PostgreSQL database directly to your host machine:
```bash
docker compose exec -T postgres pg_dump -U postgres studiosync > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restoring a Database Backup
```bash
cat your_backup.sql | docker compose exec -T postgres psql -U postgres studiosync
```

---

## 5. Setting Up Domain & HTTPS (SSL)

To secure your site with HTTPS using a free Let's Encrypt SSL certificate, install Nginx and Certbot on the Ubuntu host as a reverse proxy:

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

Configure `/etc/nginx/sites-available/studiosync`:
```nginx
server {
    server_name studiosync.example.com;

    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 64M;
    }
}
```

Enable the site and obtain the SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/studiosync /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d studiosync.example.com
```
Certbot will configure SSL and automatic certificate renewals.

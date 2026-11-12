#!/usr/bin/env bash
set -e

# =============================================================================
# StudioSync - Production Ubuntu Server Deployment Script
# =============================================================================

echo "=================================================="
echo " Starting StudioSync 24/7 Production Deployment"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker >/dev/null 2>&1; then
    echo "Error: Docker is not installed. Please install Docker first:"
    echo "  curl -fsSL https://get.docker.com | sh"
    echo "  sudo usermod -aG docker \$USER"
    exit 1
fi

# Check Docker Compose (compose plugin or standalone)
if docker compose version >/dev/null 2>&1; then
    COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE="docker-compose"
else
    echo "Error: Docker Compose is not installed."
    exit 1
fi

# Ensure .env exists
if [ ! -f .env ]; then
    echo "Creating .env from .env.docker.example..."
    cp .env.docker.example .env
    echo "================================================================="
    echo " NOTICE: A new .env file has been created from .env.docker.example."
    echo " Please open .env and set your DB_PASSWORD, APP_URL, and secrets."
    echo " Then re-run this script."
    echo "================================================================="
    exit 0
fi

# Pull latest images or code if inside git
if [ -d .git ]; then
    echo "Fetching latest git changes..."
    git pull || true
fi

# Build and start services in detached mode
echo "Building and launching containers..."
$COMPOSE up -d --build --remove-orphans

echo "Waiting for services to become healthy..."
sleep 5

# Show running status
echo "=================================================="
echo " Deployment Status:"
echo "=================================================="
$COMPOSE ps

echo ""
echo "=================================================="
echo " StudioSync is up and running 24/7!"
echo " Useful commands:"
echo "   View logs:        $COMPOSE logs -f"
echo "   Run Artisan:      $COMPOSE exec app php artisan <command>"
echo "   Database Tinker:  $COMPOSE exec app php artisan tinker"
echo "   Restart Stack:    $COMPOSE restart"
echo "   Stop Stack:       $COMPOSE down"
echo "=================================================="

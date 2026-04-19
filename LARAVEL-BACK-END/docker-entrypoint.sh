#!/bin/bash
set -e

echo "=== Barangay Connect API ==="
echo "Environment: ${APP_ENV:-production}"

# Write .env from environment variables (Render injects these)
cat > /var/www/.env << EOF
APP_NAME="${APP_NAME:-Barangay Connect}"
APP_ENV=${APP_ENV:-production}
APP_KEY=${APP_KEY}
APP_DEBUG=${APP_DEBUG:-false}
APP_URL=${APP_URL:-http://localhost:8000}

LOG_CHANNEL=stderr
LOG_LEVEL=${LOG_LEVEL:-error}

DB_CONNECTION=pgsql
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT:-5432}
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
DB_SSLMODE=${DB_SSLMODE:-require}

SESSION_DRIVER=cookie
CACHE_STORE=file
QUEUE_CONNECTION=sync
FILESYSTEM_DISK=local

FRONTEND_URL=${FRONTEND_URL:-}
SANCTUM_STATEFUL_DOMAINS=${SANCTUM_STATEFUL_DOMAINS:-}

MAIL_MAILER=${MAIL_MAILER:-log}
MAIL_FROM_ADDRESS=${MAIL_FROM_ADDRESS:-noreply@barangay.gov}
MAIL_FROM_NAME="${MAIL_FROM_NAME:-Barangay Connect}"

BROADCAST_CONNECTION=${BROADCAST_CONNECTION:-log}
EOF

echo ".env written from environment variables."

# Clear caches
php artisan config:clear 2>/dev/null || true
php artisan route:clear  2>/dev/null || true

# Cache for production
php artisan config:cache
php artisan route:cache

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Seed if roles table is empty
echo "Checking if seeding is needed..."
php artisan db:seed --force --class=DatabaseSeeder 2>/dev/null || echo "Seeding skipped (already done)."

# Storage permissions
chmod -R 775 /var/www/storage /var/www/bootstrap/cache 2>/dev/null || true

echo "=== Starting server on 0.0.0.0:${PORT:-8000} ==="
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}

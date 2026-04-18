#!/bin/bash
set -e

echo "=== Barangay Connect API Starting ==="

# Generate app key if not set
if [ -z "$APP_KEY" ]; then
  echo "Generating APP_KEY..."
  php artisan key:generate --force
fi

# Clear and rebuild caches
echo "Clearing caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo "Caching config..."
php artisan config:cache

echo "Caching routes..."
php artisan route:cache

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Seed only if the roles table is empty (prevents duplicate seeding on redeploy)
ROLE_COUNT=$(php artisan tinker --execute="echo \Spatie\Permission\Models\Role::count();" 2>/dev/null | tail -1 || echo "0")
if [ "$ROLE_COUNT" = "0" ]; then
  echo "Seeding database..."
  php artisan db:seed --force
else
  echo "Database already seeded (roles: $ROLE_COUNT) — skipping."
fi

# Set storage permissions
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

echo "=== Starting Laravel server on port ${PORT:-8000} ==="
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}

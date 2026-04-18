#!/bin/bash
set -e

echo "Caching config..."
php artisan config:cache

echo "Caching routes..."
php artisan route:cache

echo "Running migrations..."
php artisan migrate --force

echo "Running seeders..."
php artisan db:seed --force

echo "Starting server..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
#!/bin/sh
set -e

# Ensure storage and bootstrap directories exist
mkdir -p /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/framework/cache \
         /var/www/html/storage/logs \
         /var/www/html/storage/app/public \
         /var/www/html/bootstrap/cache

# Ensure correct permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Database wait function using PHP PDO
wait_for_database() {
    echo "[Entrypoint] Waiting for database connection ($DB_CONNECTION at $DB_HOST:${DB_PORT:-5432})..."
    php -r '
        $conn = getenv("DB_CONNECTION") ?: "pgsql";
        $host = getenv("DB_HOST") ?: "postgres";
        $port = getenv("DB_PORT") ?: ($conn === "pgsql" ? 5432 : 3306);
        $db   = getenv("DB_DATABASE") ?: "studiosync";
        $user = getenv("DB_USERNAME") ?: "postgres";
        $pass = getenv("DB_PASSWORD") ?: "";

        if ($conn === "sqlite") {
            echo "SQLite database selected, skipping network wait.\n";
            exit(0);
        }

        $dsn = "{$conn}:host={$host};port={$port};dbname={$db}";
        $maxRetries = 45;
        $attempt = 0;

        while ($attempt < $maxRetries) {
            try {
                $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_TIMEOUT => 2, PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
                echo "Database connection successful!\n";
                exit(0);
            } catch (Exception $e) {
                $attempt++;
                echo "Waiting for database... (attempt {$attempt}/{$maxRetries})\n";
                sleep(2);
            }
        }
        echo "Error: Could not connect to database after {$maxRetries} attempts.\n";
        exit(1);
    '
}

# Web application startup logic
if [ "$1" = "/usr/bin/supervisord" ] || [ "$1" = "supervisord" ]; then
    wait_for_database

    # Generate APP_KEY if empty
    if [ -z "$APP_KEY" ]; then
        echo "[Entrypoint] APP_KEY is not set. Generating application key..."
        php artisan key:generate --force
    fi

    # Create public storage link if not already created
    if [ ! -L /var/www/html/public/storage ]; then
        echo "[Entrypoint] Creating storage symlink..."
        php artisan storage:link || true
    fi

    # Run migrations
    if [ "${AUTORUN_MIGRATIONS:-true}" = "true" ]; then
        echo "[Entrypoint] Running database migrations..."
        php artisan migrate --force --graceful
    fi

    # Run seeders if explicitly requested
    if [ "${AUTORUN_SEEDER:-false}" = "true" ]; then
        echo "[Entrypoint] Running database seeders..."
        php artisan db:seed --force
    fi

    # Cache config, routes, views in production
    if [ "${APP_ENV:-production}" = "production" ]; then
        echo "[Entrypoint] Caching Laravel configuration, routes, and views..."
        php artisan config:cache || true
        php artisan route:cache || true
        php artisan view:cache || true
    fi

    echo "[Entrypoint] StudioSync application initialization complete. Starting Supervisor..."
elif [ "$1" = "php" ] && [ "$2" = "artisan" ]; then
    # Queue worker or scheduler container
    wait_for_database
fi

exec "$@"

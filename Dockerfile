# =============================================================================
# Stage 1: Composer Dependencies
# =============================================================================
FROM composer:2 AS composer-builder

WORKDIR /app

# Copy composer specifications
COPY composer.json composer.lock ./

# Install PHP dependencies without dev packages
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

# Copy full application codebase to generate optimized autoloader
COPY . .

RUN composer dump-autoload --optimize --no-dev

# =============================================================================
# Stage 2: Frontend Assets Compilation
# =============================================================================
FROM php:8.4-cli-bookworm AS frontend-builder

# Install Node.js 22 & NPM from official Node Bookworm image
COPY --from=node:22-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && \
    ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

WORKDIR /app

# Install npm dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source & vendor (needed for Wayfinder route/action reflection)
COPY . .
COPY --from=composer-builder /app/vendor /app/vendor

# Compile production frontend assets via Vite
RUN npm run build

# =============================================================================
# Stage 3: Production Runtime (PHP 8.4-FPM + Nginx + Supervisor)
# =============================================================================
FROM php:8.4-fpm-bookworm AS production

LABEL maintainer="StudioSync Team"

ENV DEBIAN_FRONTEND=noninteractive \
    TZ=UTC

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    curl \
    git \
    unzip \
    libpq-dev \
    postgresql-client \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install docker-php-extension-installer
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN chmod +x /usr/local/bin/install-php-extensions

# Install required PHP extensions
RUN install-php-extensions \
    pdo_pgsql \
    pgsql \
    pdo_mysql \
    pdo_sqlite \
    bcmath \
    mbstring \
    xml \
    curl \
    zip \
    gd \
    intl \
    opcache \
    pcntl \
    posix \
    redis \
    exif

# Copy configuration files
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY docker/php/php.ini /usr/local/etc/php/conf.d/99-app.ini
COPY docker/php/php-fpm.d/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

WORKDIR /var/www/html

# Copy application files with proper ownership
COPY --chown=www-data:www-data . /var/www/html
COPY --chown=www-data:www-data --from=composer-builder /app/vendor /var/www/html/vendor
COPY --chown=www-data:www-data --from=frontend-builder /app/public/build /var/www/html/public/build

# Ensure storage and bootstrap directories exist with proper permissions
RUN mkdir -p /var/www/html/storage/framework/sessions \
             /var/www/html/storage/framework/views \
             /var/www/html/storage/framework/cache \
             /var/www/html/storage/logs \
             /var/www/html/storage/app/public \
             /var/www/html/bootstrap/cache \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

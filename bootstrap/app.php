<?php

use App\Http\Middleware\CheckRoleMiddleware;
use App\Http\Middleware\EnsureProjectBookingEnabled;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

spl_autoload_register(function (string $class): void {
    if (str_starts_with($class, 'App\\')) {
        $path = __DIR__.'/../app/'.str_replace('\\', '/', substr($class, 4)).'.php';
        if (file_exists($path)) {
            require_once $path;
        }
    }
}, true, true);

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->validateCsrfTokens(except: [
            'api/webhooks/vercel',
            'webhooks/vercel',
            'api/contact/*',
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => CheckRoleMiddleware::class,
            'EnsureProjectBookingEnabled' => EnsureProjectBookingEnabled::class,
            'booking.enabled' => EnsureProjectBookingEnabled::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();

<?php

use App\Http\Middleware\EnsurePortalAccess;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Global middleware — security headers on every response
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);

        // Register middleware aliases
        $middleware->alias([
            'portal'            => EnsurePortalAccess::class,
            'role'              => RoleMiddleware::class,
            'permission'        => PermissionMiddleware::class,
            'role_or_permission'=> RoleOrPermissionMiddleware::class,
        ]);

        // Do NOT call statefulApi() — we use Bearer token auth, not cookie/CSRF auth.
        // statefulApi() adds CSRF middleware to API routes which causes 419 errors
        // when the React frontend sends requests with withCredentials: true.
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Return JSON for all API exceptions — never expose stack traces
        $exceptions->render(function (\Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                // Map exception types to correct HTTP status codes
                $status = match (true) {
                    $e instanceof \Illuminate\Auth\AuthenticationException          => 401,
                    $e instanceof \Illuminate\Auth\Access\AuthorizationException    => 403,
                    $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException => 404,
                    $e instanceof \Illuminate\Validation\ValidationException        => 422,
                    $e instanceof \Symfony\Component\HttpKernel\Exception\HttpException => $e->getStatusCode(),
                    method_exists($e, 'getStatusCode')                             => $e->getStatusCode(),
                    default                                                         => 500,
                };

                // In production, hide internal error details to prevent information leakage
                $message = config('app.debug')
                    ? $e->getMessage() ?: 'Server error.'
                    : ($status < 500 ? ($e->getMessage() ?: 'Request error.') : 'An unexpected error occurred. Please try again.');

                return response()->json([
                    'success' => false,
                    'message' => $message,
                    'data'    => null,
                    'errors'  => $e instanceof \Illuminate\Validation\ValidationException
                        ? $e->errors()
                        : null,
                ], $status);
            }
        });
    })->create();

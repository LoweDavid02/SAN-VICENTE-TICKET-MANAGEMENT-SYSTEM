<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Routing\UrlGenerator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(UrlGenerator $url): void
    {
        // Force HTTPS on Render (production)
        if (config('app.env') === 'production') {
            $url->forceScheme('https');
        }

        // ── DB connection resilience (Render free-tier cold restarts) ─────
        // Attempt to verify the DB connection is alive; retry up to 3 times
        // with a 3-second backoff before giving up. This handles the window
        // where Render restarts the PostgreSQL instance before the app boots.
        $attempts = 0;
        while ($attempts < 3) {
            try {
                DB::connection()->getPdo();
                break; // connection is good
            } catch (\Exception $e) {
                $attempts++;
                if ($attempts >= 3) {
                    throw $e; // re-throw after final attempt
                }
                sleep(3);
            }
        }

        // ── Rate Limiters ─────────────────────────────────────────────────
        // Login: 10 attempts per minute per IP — brute force protection
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        // API: 60 requests per minute per authenticated user, 30 for guests
        RateLimiter::for('api', function (Request $request) {
            return $request->user()
                ? Limit::perMinute(60)->by($request->user()->id)
                : Limit::perMinute(30)->by($request->ip());
        });

        // Uploads: 5 requests per minute per IP — prevent storage exhaustion
        RateLimiter::for('uploads', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip())
                ->response(function () {
                    return response()->json([
                        'success' => false,
                        'message' => 'Too many upload attempts. Please try again in a minute.',
                    ], 429);
                });
        });
    }
}
